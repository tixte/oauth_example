# Tixte OAuth Demo
A basic example of how to integrate Tixte OAuth with your application

## Getting Started

- Clone the GitHub repository
- Run `npm install` to install the necessary packages
- Ensure you have changed the `config.json` file to match your configuration settings
- Start the application with `npm start`

## Important Notes
This package does not include a method to handle refresh tokens. These are important for refreshing expired user access tokens for ongoing sessions. This package also does not handle token revoking or storing access tokens in a database, which is recommended for most applications.

To learn more about how oauth works, we have linked a great article below:
https://digitalocean.com/community/tutorials/an-introduction-to-oauth-2