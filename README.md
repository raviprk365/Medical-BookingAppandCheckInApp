# Medical Booking App

A comprehensive medical booking and check-in application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Appointment Booking**: Schedule appointments with healthcare providers
- **Digital Check-in**: Streamlined patient check-in process
- **Patient Portal**: Access to medical records and appointment history
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── booking/            # Booking functionality
│   │   └── page.tsx        # Booking page
│   ├── search/             # Practitioner search
│   │   └── page.tsx        # Search results page
│   ├── globals.css         # Global styles with shadcn/ui
│   ├── layout.tsx          # Root layout component
│   ├── not-found.tsx       # 404 error page
│   └── page.tsx            # Home page
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx      # Button component
│   │   ├── card.tsx        # Card component
│   │   ├── input.tsx       # Input component
│   │   ├── label.tsx       # Label component
│   │   └── ...             # Other UI components
│   ├── booking/            # Booking-specific components
│   ├── Header.tsx          # Navigation header
│   ├── FilterPanel.tsx     # Search filters
│   └── PractitionerCard.tsx # Practitioner display card
├── lib/                    # Utility functions
│   └── utils.ts            # Shared utilities (cn function, etc.)
└── types/                  # TypeScript type definitions
    └── index.ts            # Shared type definitions
```

## Documentation

- [Architecture.md](./Architecture.md) - System architecture details
- [BRD.md](./BRD.md) - Business requirements document
- [UserStories.md](./UserStories.md) - User stories and requirements

## Development

This project uses:
- **Next.js App Router** for file-based routing
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **ESLint** for code quality

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
