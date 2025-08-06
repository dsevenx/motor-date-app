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
   - **TOKEN OPTIMIZATION**: Intelligent table data reduction to prevent token limit issues

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

### Token Optimization System

**Problem Analysis:**
- System Prompt (Async): 16,074 characters (~4,000 tokens)
- System Prompt (Sync): 7,736 characters (~2,000 tokens)
- User Prompt with full tables: 26,372+ characters (~6,600+ tokens)
- **Total with full data: 42,446+ characters (~10,600+ tokens)**

**Solutions Implemented:**

1. **Smart Table Data Optimization** (`src/app/api/extract-dates/route.ts:74-109`)
   - For Sparten: Send all entries (only 4 items)
   - For Bausteine: Send active entries + first 3 inactive as examples
   - Reduces token usage by 60-80% for large Baustein tables
   - Claude still returns complete tables using provided structure as template

2. **Token Usage Monitoring**
   - Real-time token counting and breakdown analysis
   - Warnings when approaching limits (8k/10k tokens)
   - Error handling for incomplete responses due to token limits
   - Automatic fallback recommendations (SYNC vs ASYNC prompts)

3. **Increased Response Capacity**
   - `max_tokens` increased from 1,500 to 2,500 for full table responses
   - Better error messages when token limits are hit
   - Debug logging for prompt size analysis

4. **System Prompt Management**
   - SYNC version: 7,736 chars for simple requests
   - ASYNC version: 16,074 chars with full Sparten/Baustein rules
   - Automatic selection based on request complexity

**Best Practices:**
- Use `SYSTEM_PROMPT_FAHRZEUGDATEN_SYNC` for standard requests
- Monitor token usage in console for optimization opportunities  
- Test with realistic data sizes during development
- Consider table data optimization for production deployments

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
- **Optimize token usage** with selective table data transmission

### Important Patterns

- **Avoid direct table data manipulation** for produktSparten and produktBausteine
- **Use onFieldDefinitionsChange** for Sparten-related updates instead of direct field updates
- **Leverage fieldDefinitionsHelper functions** for consistent state management
- **Test AI responses** with various German insurance terminology
- **Maintain synchronization** between UI state and FIELD_DEFINITIONS data
- **Monitor token usage** to prevent incomplete AI responses

## Advanced Architecture Patterns

### EditMode Context System

The application uses a global EditMode context (`src/contexts/EditModeContext.tsx`) that fundamentally changes application behavior:

- **Edit Mode (green)**: Full functionality with Business Logic Layer integration
- **Display Mode (red)**: Read-only interface with direct database access
- **Component Integration**: All Motor components respect EditMode via `useEditMode()` hook
- **Exception Handling**: Some components (Chat, ContractTree checkboxes) use `allowInViewMode={true}` to remain functional in Display Mode

### Business Logic Layer Pattern

Three-tier data flow architecture (`src/app/api/FetchContractBL.ts`):

1. **Display Mode Flow**: `fetchContractDataBL → fetchContractDataDB`
2. **Edit Mode Flow**: `fetchContractDataBL → TardisCallVorbereiten → fetchContractTardis`  
3. **Integration Points**: All Contract consumers (ContractSidePanel, ContractTreeComponent, MotorHeader) use BL layer
4. **FIELD_DEFINITIONS Integration**: Edit mode combines user field data with database contracts

### Global State Management

Custom hooks pattern without external state libraries:

- **useGlobalChatConfig**: Manages chat configuration sharing between GUI-Test and standard pages
- **useGlobalFieldDefinitions**: Synchronizes field definitions across components (enables MotorProduktSpartenTree in Produkt page)
- **Pattern**: Module-level variables with listener arrays for React integration

### Motor Component System

Unified component architecture with standardized patterns:

- **echteEingabe Tracking**: All components track real user input vs. defaults via `fieldKey` prop
- **EditMode Awareness**: Components use `isEffectivelyDisabled = !isEditMode || disabled` pattern
- **Consistent Props**: All Motor components follow similar prop patterns (value, onChange, label, fieldKey, disabled)
- **Real Input Tracking**: `updateEchteEingabe()` function tracks actual user modifications

### KB-TH Real Input Analysis

Debugging/admin interface (`src/app/kb-th/page.tsx`):

- **Purpose**: Displays which fields contain real user input vs. system defaults
- **Visual Indicators**: Icons show input source (User input, No input yet, AI input)
- **Table Expansion**: Tables display row-wise data for detailed analysis
- **Field Grouping**: Organized by field types (dates, text, numbers, etc.)

### Layout Architecture

Sophisticated three-column layout system:

- **AppLayout**: EditModeProvider wrapper with 3/12 + 6/12 + 3/12 grid
- **Persistent Components**: ContractSidePanel, MotorHeader, ChatComponent remain on all pages
- **Independent Scrolling**: Each column scrolls independently without affecting others
- **MotorAktenMenueleiste**: Full-width menu bar at top with EditMode toggle

### Navigation System

Multi-level navigation with state management:

- **MotorAktenMenueleiste**: Complex dropdown menus with keyboard shortcuts and history navigation
- **NavigationMenu**: Hover-based submenus with active state detection
- **Page Templates**: Reusable PageTemplate for section-based navigation

### Contract Data Integration

Hierarchical contract system:

- **Tree Structure**: Expandable contract hierarchy with context menus
- **EditMode Integration**: Data loading behavior changes based on current mode
- **Business Logic Layer**: All contract data flows through BL layer
- **Visual State Management**: Active nodes, expansion states, filtering options

## Important Development Patterns

### Field Configuration System

All form fields derive from `FIELD_DEFINITIONS` array:

- **Single Source of Truth**: Field definitions drive UI generation, validation, and AI integration
- **echteEingabe Pattern**: Track real user input separately from display values
- **Dynamic Generation**: `generateDefaultValues()`, `generateFieldConfigs()`, `generateEchteEingabeValues()`
- **AI Integration**: Synonyms and validation rules support natural language processing

### EditMode Component Behavior

Components must handle EditMode appropriately:

- **Standard Behavior**: Disabled in Display Mode, enabled in Edit Mode
- **View Mode Exceptions**: Use `allowInViewMode={true}` for navigation/analysis components
- **Effective Disabled Pattern**: `const isEffectivelyDisabled = (!isEditMode && !allowInViewMode) || disabled`

### State Synchronization

Global state coordination without external libraries:

- **Global Variables**: Module-level state with listener arrays
- **React Integration**: Custom hooks provide component integration
- **Update Patterns**: Centralized update functions with listener notifications
- **Component Coordination**: Multiple components can share and synchronize state

### TypeScript Integration

Strong typing across all architectural layers:

- **Type Definitions**: `src/types/contractTypes.ts` defines data structures
- **Component Props**: Interfaces for all component prop patterns
- **API Types**: Request/response type definitions for all endpoints
- **Field Configuration**: Typed field definitions with validation rules

## Token Limit Troubleshooting

### Symptoms
- "Claude Antwort wurde durch max_tokens abgeschnitten" errors
- Incomplete JSON responses in API logs
- Missing table data in AI responses

### Debugging Steps
1. Check console for token usage breakdown: `📊 TOKEN USAGE ANALYSE`
2. Look for table optimization logs: `🔧 Token-Optimierung`
3. Monitor total prompt size vs. limits (aim for <8k tokens)

### Quick Fixes
- Use sync system prompt: `SYSTEM_PROMPT_FAHRZEUGDATEN_SYNC` instead of async version
- Clear excessive table data before testing
- Increase `max_tokens` if needed (currently 2500)
- Check optimization is working in logs

### Prevention
- Test with realistic production data sizes
- Monitor token counts during development
- Use table optimization for large datasets
- Consider breaking large requests into smaller chunks