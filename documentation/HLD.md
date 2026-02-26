# Service Index High Level Design

## Context
The Service Index is an application that can be used by customers to maintain a set of service records for their vehicle(s). It will consist of a backend and frontend that communicate via API. This design will cover the backend architecture that will be used to support the application. Customer will be able to create an account, log in, add vehicles, and add service records for their vehicle.

## Problem Statement
How can we create a lightweight backend for the Service Index that will support all of the expected features for the application?

## Requirements
1. Users are able to create an account if one does not exist, and log in to their account if one does
2. Users are able to view all of their current vehicles and the list of services done on each
3. Users can create service records on a specific vehicle, and maintain some metadata on what service is being recorded
4. Users will be able to see which services need to be performed soon per vehicle
5. Users will be alerted/notified for when a specific service is nearing or passed the expected service window
6. Users can export all the service records for a specific vehicle in a readable format (pdf, csv, etc)

## Assumptions
1. Users will have enough knowledge of vehicle maintenance to add service records
2. Most serviceable parts of a car have a regular interval for repair/replacement (6 months, 1 year, 5 years, etc)
3. (stretch) There is an available, deterministic way to determine make and model of a car based off of VIN
    1. May not be added as a feature, potentially unsafe to store VIN as this is identifiable information if paired with user info like name

## Proposed Architecture
* Node server to expose CRUD API (and any additional endpoints needed for frontend to function)
* React on the frontend for modern UI/UX
  * Also to leverage the component lifecycle of react
* Database will be hosted locally with SQLite
* Sequelize for the ORM in Node to interact with SQLite DB
* **TODO: Add technology** used to easily add endpoints to the API
* Frontend will make http/https or curl calls to the backend's localhost for connectivity
* **Authentication**: JWT-based auth. A single secret key (e.g. generated with `openssl rand -hex 32`) is stored in `.env` as `SECRET_KEY`, read via Node `process.env`, and not committed to git. The backend uses this secret to sign and verify tokens. The frontend stores the issued token in **client session storage**; default token expiry is **2 hours**, with an optional "Remember me" acknowledgement extending expiry to **2 days**. Passwords are stored securely (e.g. hashed with salt) in the database; only the token is sent on API requests.
___

* Tables in DB
    * Users
    * Vehicles
    * Makes
    * Models
    * VehicleServices
    * Services (available, supported services)
    * Alerts

## Alternatives
Some potential alternatives could be a change of language or local storage solution. Rather than running a Node server via TypeScript - we could opt for other performant languages like Java, Python, or GoLang as well. 

## Potential Enhancements
Rather than running this project only locally - we can opt in the future to move the back and frontend onto cloud infrastructure. Options like AWS, GCP, or Microsoft Azure could be leveraged to host compute for the service. Since the application and it's behavior is relatively lightweight with a simple API and DB layer that the frontend makes call to, we can accomplish this using a few services from AWS.

The most cost-efficient AWS option would be to host the compute using Lambda, as the service is low traffic and does not require long-running processes that another service like ECS/EC2 would provide. We can attach an API Gateway that routes to the lambda to perform the CRUD operations that are called from the frontend. Authentication can be managed via Cognito, using tokens for the frontend to make calls to the API Gateway. For storage, if we choose to continue using an SQL/relational database, we can use RDS - although a dedicated cluster may be overkill unless the service scales and we require complex joins of data. Otherwise, a cheaper alternative would be using an adjacency matrix based approach using DynamoDB. The latter option would require us to rewrite the DB access layer on the backend however (to use query/scan operations with DDB over SQL with RDS). One more benefit of DDB is that we woul not need to maintain any migrations as DDB has a flexible table schema. However, a downside is that we may also need to account for hot partitioning and setting up an efficient partition/sort key to decrease latency for lookups. Though performance could be enchanced using GSI's.

## Appendix