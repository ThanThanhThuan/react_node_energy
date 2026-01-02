require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors');
const { createObjectCsvStringifier } = require('csv-writer');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: 'energy_db',
    password: process.env.DB_PASSWORD,
    port: 5433,
});

// EIA API v2 Endpoint for Electricity Generation
const EIA_URL = 'https://api.eia.gov/v2/electricity/electric-power-operational-data/data';

// Helper: Linear Regression for Forecasting
const calculateForecast = (dataPoints) => {
    const n = dataPoints.length;
    if (n === 0) return [];

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    dataPoints.forEach((point, index) => {
        sumX += index;
        sumY += point.value;
        sumXY += index * point.value;
        sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Forecast next 5 periods
    return Array.from({ length: 5 }, (_, i) => ({
        period: `Forecast ${i + 1}`,
        value: slope * (n + i) + intercept
    }));
};

// Route: Get Energy Data (Fetch from EIA -> Save to DB -> Return to Client)
app.get('/api/energy', async (req, res) => {
    const { state = 'US-TOTAL' } = req.query;

    try {
        // 1. Check DB first (Caching Strategy)
        const dbResult = await pool.query(
            'SELECT * FROM energy_data WHERE state_code = $1 ORDER BY period DESC LIMIT 100',
            [state]
        );

        if (dbResult.rows.length > 0) {
            return res.json(dbResult.rows);
        }

        // 2. If no data, fetch from EIA API v2
        // Fetching Net Generation (generation) by Fuel Type
        const response = await axios.get(EIA_URL, {
            params: {
                api_key: process.env.EIA_API_KEY,
                frequency: 'monthly',
                'data[0]': 'generation',
                'facets[location][]': state,
                'sort[0][column]': 'period',
                'sort[0][direction]': 'desc',
                offset: 0,
                length: 50
            }
        });

        const rawData = response.data.response.data;

        // 3. Insert into DB (Simplified batch insert logic)
        // In production, use pg-format or proper batching
        for (const row of rawData) {
            await pool.query(
                'INSERT INTO energy_data (state_code, period, sector, fuel_type, generation_mwh) VALUES ($1, $2, $3, $4, $5)',
                [row.location, row.period, row.sectorDescription, row.fueltypeid, row.generation]
            );
        }

        res.json(rawData);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route: Renewable Forecast
app.get('/api/forecast', async (req, res) => {
    // Mocking data fetching for renewable specific fuel types (WND, SUN)
    const result = await pool.query(
        "SELECT period, SUM(generation_mwh) as value FROM energy_data WHERE fuel_type IN ('WND', 'SUN') GROUP BY period ORDER BY period ASC"
    );

    const history = result.rows.map(r => ({ ...r, value: parseFloat(r.value) }));
    const forecast = calculateForecast(history);

    res.json({ history, forecast });
});

// Route: Export CSV
app.get('/api/export', async (req, res) => {
    const result = await pool.query('SELECT * FROM energy_data');

    const csvStringifier = createObjectCsvStringifier({
        header: [
            { id: 'period', title: 'Period' },
            { id: 'state_code', title: 'State' },
            { id: 'fuel_type', title: 'Fuel Type' },
            { id: 'generation_mwh', title: 'Generation (MWh)' }
        ]
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    res.send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(result.rows));
});

app.listen(5000, () => console.log('Server running on port 5000'));