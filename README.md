## Energy Consumption & Sustainability Dashboard
📖 Project Overview

The Energy Consumption & Sustainability Dashboard is a full-stack web application designed to track, visualize, and analyze energy generation data across the United States. 
Utilizing the U.S. Energy Information Administration (EIA) Open Data API v2, the application provides researchers and policy enthusiasts with tools to monitor the shift from fossil fuels
to renewable energy sources.

The system employs a caching strategy using PostgreSQL to minimize API usage and improve performance, while Linear Regression algorithms in the backend provide forecasting data
for future renewable adoption.

🚀 Key Features

    Interactive Visualization: Dynamic charts (Line, Bar, Pie) rendering real-time data on Electricity, Oil, and Renewables using Recharts.

    Geographic Comparison: Filter and compare energy generation metrics between the total U.S. output and specific states (e.g., California, Texas, New York).

    Sustainability Forecasting: A custom backend algorithm analyzes historical data to project future renewable energy adoption rates over the next 5 periods.

    Data Export: Automated generation of CSV reports for offline research and analysis.

    Smart Caching: Implements a "Cache-First" strategy where data is stored in a local PostgreSQL database to reduce external API calls and latency.

🛠️ Tech Stack
Frontend

    Framework: React.js (Create React App)

    Visualization: Recharts

    Styling: Tailwind CSS (via utility classes)

    HTTP Client: Axios

    Icons: Lucide-React

Backend

    Runtime: Node.js

    Framework: Express.js

    Data Processing: Linear Regression (Custom Logic), CSV-Writer

    Security: Dotenv (Environment variable management)

Database & Data

    Database: PostgreSQL (Relational Data Store)

    Source API: EIA Open Data API v2

    Query Language: SQL

<img width="1892" height="1091" alt="image" src="https://github.com/user-attachments/assets/0947e9f3-d0e3-4a66-a5f7-f2d8e33e8a9c" />
