# Multi-Store Point of Sales System

A modern, microservice-based POS system with offline capabilities designed for multi-store operations with complex product variations.

## Key Features

- **Microservice Architecture**: Scalable, modular, and resilient system architecture
- **Offline Capability**: Continue operations even when internet connection is lost
- **Product Variations and Customizations**: Support for complex product combinations (e.g., bubble tea shops)
- **Multi-Store Management**: Manage multiple store locations with a single system
- **Real-time Synchronization**: Automatically sync data when connectivity is restored
- **Responsive UI**: Works on desktops, tablets, and mobile devices

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: React.js, Service Workers
- **Database**: MongoDB
- **Caching**: Redis
- **Message Broker**: RabbitMQ
- **API Gateway**
- **Container Orchestration**: Docker, Kubernetes

## Microservices

The system is composed of multiple specialized microservices:

- **Auth Service**: User authentication and authorization
- **Product Service**: Products, categories, and variations management
- **Inventory Service**: Stock tracking across stores
- **Order Service**: Order processing and management
- **Payment Service**: Payment processing
- **Store Service**: Store information management
- **Sync Service**: Offline synchronization handling
- **Notification Service**: Notifications to staff and customers

## Frontend Applications

- **Admin Dashboard**: Store management interface
- **POS Terminal**: Point of sale application with offline capabilities

## Architecture

The system follows a microservice architecture with an API Gateway pattern:

- Each service is independent and handles its own data storage
- Services communicate via RabbitMQ for asynchronous messaging
- API Gateway provides a unified entry point for client applications
- Redis is used for caching frequently accessed data
- MongoDB provides the primary data storage
- Service workers and IndexedDB enable offline capabilities

For more details, see the [Architecture Documentation](docs/architecture/overview.md).

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/download/) (for development)
- [npm](https://www.npmjs.com/get-npm) (for development)

### Development Setup

1. Clone the repository:

`ash
git clone https://github.com/yourusername/pos-system.git
cd pos-system
`

2. Install dependencies:

`ash
make install
`

3. Set up environment variables:

`ash
cp .env.example .env
# Edit .env with your configuration
`

4. Start the development environment:

`ash
make dev
`

This will start all the required services in development mode with Docker Compose.

5. Access the applications:

- POS Terminal: http://localhost:3100
- Admin Dashboard: http://localhost:3200
- API Gateway: http://localhost:3000

### Production Deployment

For production deployments, follow the [Deployment Guide](docs/deployment/kubernetes.md).

## Project Structure

The project follows a monorepo structure:

- /services: Contains all backend microservices
- /frontend: Contains frontend applications
- /api-gateway: API Gateway service
- /shared: Shared libraries and models
- /deployment: Deployment configurations
- /docs: Documentation

## Development Workflow

The project follows a feature branch workflow:

1. Create a feature branch from develop
2. Implement your changes
3. Write tests
4. Submit a pull request to develop
5. After review and approval, merge into develop
6. Periodically, develop is merged into main for releases

## Design Principles

This project follows these principles:

- **YAGNI (You Aren't Gonna Need It)**: Avoid adding features until they are necessary
- **SOLID**: Follow SOLID principles for object-oriented design
- **KISS (Keep It Simple, Stupid)**: Prefer simple solutions over complex ones
- **DRY (Don't Repeat Yourself)**: Avoid code duplication

## Testing

To run the tests:

`ash
make test
`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
