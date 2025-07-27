# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Working Directory
```bash
cd motor-date-app
```

### Development Server
```bash
npm run dev  # Starts Next.js development server on localhost:3000
```

### Build & Production
```bash
npm run build  # Creates production build
npm run start  # Starts production server
```

### Linting
```bash
npm run lint  # Runs ESLint for code quality checks
```

## Project Architecture

This is a **Next.js 15** vehicle data management application with AI-powered chat functionality. The project structure follows the Next.js App Router pattern.

### Core Architecture Components

1. **Dynamic Field Configuration System** (`src/constants/fieldConfig.tsx`)
   - Central configuration for all form fields via `FIELD_DEFINITIONS` array
   - Supports multiple field types: date, text, number, tristate, dropdown, table
   - Each field includes synonyms for AI recognition and validation rules
   - Generates default values and field configs dynamically

2. **AI Chat Integration** (`src/components/ChatComponent.tsx`)
   - Uses Anthropic Claude API for natural language processing
   - Extracts vehicle data from user messages and updates form fields
   - Implements confidence scoring and validation feedback
   - Supports real-time field updates based on conversation context

3. **API Route** (`src/app/api/extract-dates/route.ts`)
   - Next.js API route handling Claude AI requests
   - Processes user text and current field values
   - Returns structured data extraction with confidence scores
   - Includes retry logic for JSON parsing reliability

4. **Component System**
   - Reusable Motor components for different field types (MotorDate, MotorEditText, etc.)
   - Each component follows consistent prop patterns and validation
   - Supports disabled states and custom styling

### Key Dependencies

- **@anthropic-ai/sdk**: Claude AI integration
- **@ai-sdk/anthropic**: AI SDK for Claude
- **lucide-react**: Icon system
- **tailwindcss**: Styling framework

### Environment Variables

The application requires `ANTHROPIC_API_KEY` for Claude AI functionality.

### Data Flow

1. User inputs data via form fields or chat
2. Chat messages are processed by Claude API
3. Extracted data updates field values via onChange handlers
4. Field configurations maintain consistency across the application
5. Real-time validation and feedback provided to users

### Special Features

- **Dynamic table support** for complex data like vehicle accessories and mileage records
- **Tristate checkboxes** for J/N/ (Yes/No/Unknown) fields
- **Dropdown integration** with domain data fetching
- **German localization** throughout the interface
- **Responsive design** with two-column layout (form + chat)

### Sparten (Insurance Product Lines) System

The application includes a sophisticated insurance product management system:

1. **Single Point of Truth Pattern** (`src/utils/fieldDefinitionsHelper.ts`)
   - All product data flows through `FIELD_DEFINITIONS`
   - Helper functions for state management and validation
   - Prevents data inconsistencies across components

2. **MotorProduktSpartenTree Component** (`src/components/MotorProduktSpartenTree.tsx`)
   - Hierarchical tree view for insurance products (Sparten) and building blocks (Bausteine)
   - Integrates with AI chat for automatic product activation
   - Uses `onFieldDefinitionsChange` callback pattern for state updates

3. **AI-Driven Product Recognition**
   - Claude AI recognizes insurance product mentions in natural language
   - Automatically activates relevant Sparten based on user input
   - Supports complex scenarios like "Vollkasko 300/150" (comprehensive coverage)
   - Handles exclusions and "not explicitly mentioned" cases appropriately

4. **Product State Management**
   - Each Sparte has states: Active ('A'), Inactive (' '), Cancelled ('S')
   - Building blocks (Bausteine) can be individually configured
   - Amounts (Betrag) are editable when products are selected

### System Prompts and AI Integration

The application uses sophisticated system prompts (`src/constants/systempromts.tsx`) that:
- Define field recognition patterns and synonyms
- Include German insurance domain knowledge
- Handle complex date patterns and vehicle data extraction
- Support dropdown value mapping via artifact system
- Implement Sparten recognition rules for insurance products

### Important Patterns

- **Avoid direct table data manipulation** for produktSparten and produktBausteine
- **Use onFieldDefinitionsChange** for Sparten-related updates instead of direct field updates
- **Leverage fieldDefinitionsHelper functions** for consistent state management
- **Test AI responses** with various German insurance terminology
- **Maintain synchronization** between UI state and FIELD_DEFINITIONS data