# NovateScribe Frontend

AI-Powered Medical Documentation Platform - Frontend Application

## 🚀 Features

- **Voice Recognition**: Advanced AI that understands medical terminology with 99% accuracy
- **Structured Templates**: Automatically organizes information into professional medical templates
- **Time Saving**: Reduce documentation time by up to 75%
- **Analytics Dashboard**: Gain insights into practice patterns and efficiency
- **HIPAA Compliant**: Enterprise-grade security with end-to-end encryption
- **AI Suggestions**: Smart recommendations for diagnoses and treatments

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Authentication**: JWT-based auth system
- **AI Integration**: OpenAI API
- **Vector Database**: Pinecone

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Backend API server running

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd NovateScribeFrontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the environment template and configure your variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Backend Configuration
BACKEND_URL=http://localhost:3001

# Frontend Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts
- `npm run analyze` - Analyze bundle size

## 🚀 Production Deployment

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:

```env
# Required
BACKEND_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key

# Optional
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
```

### Build and Deploy

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm run start
   ```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### AWS Amplify
1. Connect your repository to AWS Amplify
2. Configure build settings
3. Set environment variables in Amplify console

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` or any files containing secrets
- Use different API keys for development and production
- Rotate API keys regularly

### Security Headers
The application includes security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- X-XSS-Protection: 1; mode=block

### Authentication
- JWT tokens are stored in localStorage (consider httpOnly cookies for enhanced security)
- Automatic token verification on app load
- Protected routes with authentication checks

## 📊 Performance Optimization

### Built-in Optimizations
- Next.js automatic code splitting
- Image optimization enabled
- SWC minification
- Compression enabled
- React Strict Mode enabled

### Bundle Analysis
Run bundle analysis to identify optimization opportunities:
```bash
npm run analyze
```

## 🐛 Error Handling

The application includes:
- Global error boundary for React errors
- API error handling with user-friendly messages
- Toast notifications for user feedback
- Development error details (hidden in production)

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Keep your dependencies updated:
```bash
npm update
npm audit fix
```

## 📈 Monitoring

Consider adding monitoring services for production:
- Sentry for error tracking
- Google Analytics for user analytics
- Performance monitoring tools 