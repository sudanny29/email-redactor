# Email Redactor

A modern web application for email privacy that allows users to redact email addresses, transforming sensitive contact information into a more secure display format.

## Features

- Redact email addresses to show only the domain and first three characters
- Option to scramble which characters are visible for enhanced privacy
- Copy redacted emails to clipboard with one click
- Dark and light mode support
- Responsive web design with a minimalist user interface

## Technology Stack

- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Vite for development and building

## Privacy

All email redaction happens directly in your browser. No emails are sent to any server or stored outside of your browser's memory while using the application.

## Deployment

This application is configured for easy deployment to Vercel:

1. Push this repository to GitHub
2. Connect your Vercel account to GitHub
3. Create a new project and select this repository
4. Deploy with the default settings (Vite framework preset)

## Development

To run this project locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:5000

## License

MIT
