// MongoDB initialization script
// This script runs when the MongoDB container is first created

// Switch to the jobcore database
db = db.getSiblingDB('jobcore');

// Create collections with proper indexes
db.createCollection('jobs');
db.createCollection('companies');
db.createCollection('jobportals');
db.createCollection('userjobs');
db.createCollection('resumes');

// Create indexes for better performance
db.jobs.createIndex({ "title": "text", "description": "text", "location": "text" });
db.jobs.createIndex({ "company": 1 });
db.jobs.createIndex({ "publishedAt": -1 });
db.jobs.createIndex({ "location": 1 });
db.jobs.createIndex({ "applicationUrl": 1 });

db.companies.createIndex({ "name": "text" });
db.companies.createIndex({ "name": 1 });
db.companies.createIndex({ "jobportal_id": 1 });

db.jobportals.createIndex({ "name": 1 });

db.userjobs.createIndex({ "userId": 1 });
db.userjobs.createIndex({ "jobId": 1 });
db.userjobs.createIndex({ "userId": 1, "jobId": 1 });
db.userjobs.createIndex({ "createdAt": -1 });

db.resumes.createIndex({ "userId": 1 });
db.resumes.createIndex({ "createdAt": -1 });

// Create application user (optional)
db.createUser({
  user: "jobcore_user",
  pwd: "jobcore_password",
  roles: [
    {
      role: "readWrite",
      db: "jobcore"
    }
  ]
});

print("MongoDB initialization completed successfully!");
print("Database: jobcore");
print("Collections created: jobs, companies, jobportals, userjobs, resumes");
print("Indexes created for optimal performance");
print("Application user created: jobcore_user"); 