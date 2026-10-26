Spendly --- Personal Finance & Smart Savings Tracker
Spendly is a full-stack personal finance application for tracking
income, expenses, monthly budgets, and savings goals. It includes a
dashboard with charts and rule-based insights.
Project status: Portfolio/academic project. Verify all features
and test results against the current code before presenting them as
production-ready.

Features
- Authentication: User registration and login using Spring
  Security, BCrypt password hashing, and JWT-based authentication.
- Dashboard: Monthly income, expenses, net remaining, savings
  rate, and trend summaries.
- Charts: Category expense breakdown and monthly cash-flow
  visualization using Recharts.
- Transactions: Create, view, update, and delete transactions,
  with filtering, searching, sorting, pagination, and CSV export where
  implemented.
- Budgets: Set monthly spending limits by category and show
  warnings at 80% usage and alerts when a budget reaches or exceeds
  100%.
- Savings goals: Set targets, track progress, and record
  contributions.
- Insights: Rule-based observations about spending and savings
  patterns.
- Settings: Profile and password settings, plus currency display
  preferences (INR, USD, EUR, and GBP) where supported by the current
  implementation.
- Local database: Uses SQLite for local persistence.
Technology Stack
Frontend
- React
- Vite
- React Router
- Axios
- Recharts
- Lucide React
- CSS
Backend
- Java (Java 21 is the recommended version for this project
  configuration)
- Spring Boot 3.3.4
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security
- JJWT for JWT handling
- Bean Validation
- Maven Wrapper
Database
- SQLite
- Xerial SQLite JDBC driver
- Hibernate community SQLite dialect

Install the following before running the application:
- JDK 21 (recommended for the current build configuration)
- Node.js and npm (Node.js 18 or newer)
- Git (optional for running locally, required for Git-based
  workflows)
- Postman (optional, for API testing)
Check your installed versions:
java -version
node --version
npm --version
git --version
Run the Application Locally
Run the backend and frontend in two separate terminals. Commands
below are for Windows PowerShell.
1. Start the backend
From the project root:
cd .\backend
.\mvnw.cmd spring-boot:run
On the first run, Maven may need to download dependencies, so an
internet connection and sufficient disk space are required.

The backend is expected to start at:
http://localhost:8080
The SQLite database is configured for local persistence. Check
backend/src/main/resources/application.properties for the configured
database path and server settings.
2. Start the frontend
Open a second terminal from the project root:
cd .\frontend
npm install
npm run dev
Vite normally displays a local URL such as:
http://localhost:5173
Open the URL shown in your terminal. The frontend API proxy is
configured in frontend/vite.config.js; confirm that it forwards /api
requests to the backend at http://localhost:8080.
Troubleshooting
- Not enough disk space: Free up space on the drive used by your
  Windows profile and project. npm and Maven cache files may also use
  the system drive.
- Backend fails to start: Review the first meaningful error in the
  backend terminal and confirm the installed Java version matches the
  project configuration.
- Frontend cannot reach the API: Confirm the backend is running
  and check the Vite proxy configuration.
- Port already in use: Stop the other process using the port or
  configure a different port consistently.
Tests and Build Checks
Run these commands from the relevant folders. Report test results in
your portfolio only after confirming the commands complete successfully.
Backend tests
cd .\backend
.\mvnw.cmd test
Frontend production build
cd .\frontend
npm run build
API Testing with Postman
If the repository includes
postman/Spendly_API.postman_collection.json:
1. Open Postman.
2. Select Import and choose the collection file.
3. Run the registration or login request using your local backend.
4. Follow any collection instructions for saving and reusing the
   authentication token.
5. Test the endpoints supported by your current backend implementation.
The collection's requests and scripts may need adjustment if the API
changes.
Database and Privacy
Spendly uses SQLite for local persistence. The database file may contain
personal financial data and should not be committed to a public
repository.
- Back up the database by copying it to a secure location while the
  application is stopped.
- Keep credentials, JWT signing secrets, passwords, access tokens, and
  personal data out of Git.
- If configuration requires secrets, use environment variables or a
  local, untracked configuration file. Provide a sanitized example
  configuration when useful.
- Never commit a real .env file or a database containing private
  information.
Security Notes
The project uses JWT-based authentication and password hashing. Before
using it with real users or deploying it publicly, review the
authentication flow, authorization checks, secret management, CORS
configuration, input validation, error handling, dependency versions,
and production deployment settings. A portfolio project should not be
assumed production-ready without a security review.
Explaining the Project in an Interview
Spendly is a full-stack personal finance tracker built with React on
the frontend, Spring Boot on the backend, and SQLite for data storage.
Users can record income and expenses, monitor monthly budgets, track
savings goals, and view financial summaries and charts. The backend
provides REST APIs and uses Spring Security with JWT authentication.
The project helped me practice full-stack development, API
integration, database design, authentication, and building a
responsive user interface.

Be prepared to explain the parts you personally implemented, how the API
and database work, and how you tested the application.
License
No open-source license is specified by this README. If you want others
to reuse or modify this project, choose a license and add its full text
in a LICENSE file. Otherwise, remove this section or state your
intended usage terms clearly.