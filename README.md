# JobCore 🚀

**The All-in-One Job Search and Career Management Platform**

JobCore is a modern, high-performance job aggregator that unifies listings from hundreds of sources, including top-tier platforms like Greenhouse, Lever, and Workday, into a single, searchable interface. It features a powerful user dashboard, AI-powered resume tailoring, and a blazing-fast search experience powered by Typesense.

## ✨ Key Features

  * **🌐 Unified Job Search**: Search for jobs across our internal database and dozens of external platforms simultaneously.
  * **⚡ High-Performance Search**: Get instant, typo-tolerant search results powered by **Typesense** for internal jobs, with a fallback to MongoDB for resilience.
  * **🤖 AI Resume Tailoring Studio**: Upload your resume and get AI-powered suggestions from **GPT-4o-mini** to tailor it perfectly for a specific job description.
  * **👤 Personalized User Dashboard**: Manage your uploaded resumes, track saved jobs, and monitor your application activity all in one place.
  * **📂 Platform & Company Directory**: Explore companies based on the hiring platforms they use (e.g., Greenhouse, Lever) and view all their open roles.
  * **📄 Resume Management**: Upload multiple resumes (PDF, DOC, DOCX), which are parsed, stored securely on **Vercel Blob**, and can be viewed directly in the app.
  * **🔒 Secure Authentication**: User sign-up, sign-in, and Google OAuth are handled securely by **Supabase**.

## 🏗️ System Architecture

JobCore is built with a modern, containerized architecture, making it scalable and easy to manage. All services are orchestrated via Docker Compose.

```
+----------------+      +----------------+      +---------------------+
|                |      |                |----->|  Frontend (Vite)    |
|      User      |----->|  Nginx Proxy   |      +---------------------+
|                |      |                |
+----------------+      +----------------+      +---------------------+
                             |------------->|  Backend (Express)  |
                                           +---------------------+
                                               |          |
                           +-------------------+----------+
                           |         |         |          |
        +------------------+         |         |          +--------------------+
        |                            |         |                               |
+-------+-------+         +----------+--+   +--+--------+         +------------+---+
| MongoDB       |         | Redis       |   | Typesense |         | External Services |
| (Database)    |         | (Cache)     |   | (Search)  |         | (Supabase, OpenAI)|
+---------------+         +-------------+   +-----------+         +-------------------+
```

*Source: `DOCKER_README.md`*

## 🛠️ Technology Stack

The project is a full-stack monorepo with a clear separation between the frontend and backend services.

### Frontend

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 18, Vite | Fast, modern frontend development. |
| **Language** | TypeScript | Type safety and scalability. |
| **Routing** | React Router DOM | Client-side routing and navigation. |
| **Styling** | Tailwind CSS | Utility-first CSS framework. |
| **Animations** | Framer Motion | Rich, declarative animations. |
| **File Uploads** | Uppy | A sleek, modular file uploader for resumes. |
| **Icons** | Lucide React | A beautiful and consistent icon set. |
| **UI Components** | Custom-built UI with interactive and animated elements. |

### Backend

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime/Framework** | Node.js, Express | Building the core API. |
| **Language** | TypeScript | Type safety for the backend. |
| **Database** | MongoDB with Mongoose | Primary data storage. |
| **Search Engine** | Typesense | High-performance, typo-tolerant search. |
| **Caching** | Redis (via Upstash) | Caching API responses for speed. |
| **Authentication** | Supabase | Handles user sign-up, sign-in, and OAuth. |
| **AI Integration** | Vercel AI SDK, OpenAI | Powers resume parsing and tailoring. |
| **File Storage** | Vercel Blob | For storing uploaded resume files. |
| **File Parsing** | `pdf-parse`, `mammoth` | Extracts text from PDF and DOCX files. |

## 🚀 Getting Started

This project is fully containerized with Docker, making setup straightforward.

### Prerequisites

  * Docker Engine 20.10+
  * Docker Compose v2.0+

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/JobCore.git
    cd JobCore
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file by copying the example file.

    ```bash
    cp env.example .env
    ```

    Now, open the `.env` file and add your credentials for **Supabase** and **OpenAI**. The other services are configured to work locally within Docker.

3.  **Start all services:**
    Run the following command to build and start all containers in detached mode.

    ```bash
    docker-compose up -d
    ```

4.  **Initialize Typesense:**
    After the containers are running, you need to initialize the Typesense collection and index the existing jobs from the database.

    ```bash
    # Step 1: Initialize the 'jobs' collection
    curl -X POST http://localhost:5000/api/jobs/typesense/init

    # Step 2: Bulk-index all jobs from MongoDB into Typesense
    curl -X POST http://localhost:5000/api/jobs/typesense/bulk-index
    ```

    *Source: `setup-typesense.md`, `DOCKER_README.md`*

5.  **Access the Application:**

      * **Frontend**: `http://localhost:80` (via Nginx) or `http://localhost:5173` (direct Vite HMR)
      * **Backend API**: `http://localhost:5000`
      * **Typesense API**: `http://localhost:8108`

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please refer to the `DOCKER_README.md` for guidelines on running the services in development mode with hot reloading.

## 📄 License

Distributed under the MIT License. See the `licence` field in `package.json` for more information. 