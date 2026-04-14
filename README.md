<!-- Project Badges -->

[![Issues](https://img.shields.io/github/issues/bcgov/nr-fam-idim-lookup-proxy)](/../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bcgov/nr-fam-idim-lookup-proxy)](/../../pulls)
[![MIT License](https://img.shields.io/github/license/bcgov/nr-fam-idim-lookup-proxy.svg)](/LICENSE)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# Simple Webservice proxy for FAM

# Local Setup

-   Copy the content in the `local-dev.env` file and create a `.env` file. Update the value of the enviornment secrets (The secrets value can be found in our Openshift namespace e4bc30). 
    The project reads environment variables using the dotenv package and NestJS's ConfigModule; This loads variables from your .env file into process.env automatically at startup. It access environment variable through process.env.[THE_VARIABLE].
-   Install the packages `npm install  --ignore-scripts`
-   Run the application `npm run start`

# Acknowledgements

This Action is provided courtesty of the Forestry Suite of Applications, part of the Government of British Columbia.
