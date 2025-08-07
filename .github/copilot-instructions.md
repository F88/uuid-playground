# UUID Playground - GitHub Copilot Instructions

UUID Playground is a React + TypeScript + Vite web application for generating, validating, and analyzing UUIDs (Universally Unique Identifiers). It provides UUID generation for versions 1, 4, and 7, batch operations, and comprehensive UUID analysis with metadata extraction.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Setup
- **Install dependencies**: `npm install` -- takes ~45 seconds. NEVER CANCEL.
- **Node.js requirement**: Uses Node.js with ESM modules. The project is configured for Node.js with package.json type "module".

### Build and Development
- **Development server**: `npm run dev` -- starts in ~200ms, serves on http://localhost:5173
- **Production build**: `npm run build` -- takes ~6 seconds. NEVER CANCEL. Set timeout to 60+ seconds for safety.
  - Runs TypeScript compilation (`tsc -b`) followed by Vite build
  - Outputs to `dist/` directory with optimized assets
- **Preview built app**: `npm run preview` -- serves production build on http://localhost:4173
- **Lint code**: `npm run lint` -- takes ~1-2 seconds. Uses ESLint with flat config format.
- **Deploy**: `npm run deploy` -- deploys to GitHub Pages using gh-pages

### Critical Build Notes
- **NEVER CANCEL any build commands** - Though builds are fast (~6s), always use 60+ second timeouts
- **ESLint configuration**: Uses flat config format (eslint.config.js) with simplified setup due to missing optional dependencies
- **TypeScript**: Configured with strict type checking and path aliases (@/* -> ./src/*)

## Validation

### Manual Testing Scenarios
**ALWAYS manually validate new code by running through these complete scenarios:**

1. **UUID Generation Flow**:
   - Start dev server with `npm run dev`
   - Navigate to http://localhost:5173
   - Select UUID version (1, 4, or 7)
   - Click "Generate UUID" button
   - Verify UUID appears in analysis section and generated list
   - Verify analysis shows correct version, validity, and metadata

2. **Batch Generation**:
   - Set quantity (1-100)
   - Click "Generate Batch"
   - Verify correct number of UUIDs generated
   - Verify all UUIDs are valid and show in list

3. **UUID Analysis**:
   - Paste or type a UUID in the decoder input
   - Verify analysis results show: validity, version, variant, timestamp (for v1/v7), random bits, hex string
   - Test with invalid UUID to verify error handling

4. **Copy and Export Functions**:
   - Click any generated UUID to copy to clipboard
   - Verify toast notification appears
   - Click "Export" to download UUIDs as text file
   - Click "Clear" to remove all generated UUIDs

### Build Validation
- **Always run** `npm run build` after making changes to verify production build works
- **Always run** `npm run lint` to catch code style issues
- **Test both dev and preview**: Ensure both `npm run dev` and `npm run preview` work correctly

## Common Tasks

### File Structure
```
./
├── src/
│   ├── App.tsx                 # Main application component
│   ├── components/ui/          # shadcn/ui components
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript type definitions
├── x-files/                   # Gemini CLI context files
│   ├── REQUIREMENTS.MD        # System requirements
│   ├── DESIGN.MD             # Design specifications
│   └── TECH_STACK.MD         # Technology stack info
├── public/                    # Static assets
├── dist/                      # Build output (generated)
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint flat config
├── tailwind.config.js        # Tailwind CSS config
└── index.html               # HTML template
```

### Key Dependencies
- **React 19.1.1** with TypeScript for UI
- **Vite 7.0.6** for build tooling and dev server
- **uuid 11.1.0** for UUID generation (v1, v4, v7)
- **shadcn/ui** for UI components (Button, Card, Input, ToggleGroup)
- **Tailwind CSS** for styling
- **sonner** for toast notifications
- **lucide-react** for icons

### Development Patterns
- **Component structure**: Uses shadcn/ui components with Tailwind CSS classes
- **State management**: React useState for local component state
- **UUID operations**: Direct usage of uuid library functions (uuidv1, uuidv4, uuidv7)
- **Analysis logic**: Custom UUID parsing in `analyzeUUID` function in App.tsx
- **Styling**: Tailwind utility classes following design system in x-files/DESIGN.MD

### Configuration Details
- **Vite config**: Uses React plugin, base path "./", and path alias "@" -> "./src"
- **TypeScript**: Strict mode enabled, ES2020 target, bundler module resolution
- **ESLint**: Simplified flat config using only available plugins (@typescript-eslint, react-hooks, react-refresh)
- **No test framework**: Currently no test suite configured (no Jest/Vitest/Playwright tests)

### Troubleshooting
- **ESLint issues**: If linting fails, check eslint.config.js uses only installed plugins
- **Build failures**: Ensure TypeScript compilation passes before Vite build
- **Development server**: If dev server fails to start, check port 5173 availability
- **Missing dependencies**: Run `npm install` if encountering import errors

### Performance Notes
- **npm install**: ~45 seconds with some deprecated package warnings (normal)
- **Development startup**: ~200ms to start dev server
- **Production build**: ~6 seconds for full TypeScript + Vite build
- **Linting**: ~1-2 seconds with TypeScript version warning (normal)

### GitHub Integration
- **Gemini CLI**: Repository uses Gemini CLI for AI-assisted development
- **GitHub Pages**: Configured for deployment via `npm run deploy`
- **CI/CD**: GitHub workflows for Gemini CLI integration (no standard build/test CI)

## Important Notes

- **No backend required**: Pure frontend application, all UUID operations run client-side
- **Browser compatibility**: Modern browsers with ES2020 support required
- **Clipboard API**: Copy functionality requires secure context (HTTPS in production)
- **File paths**: Always use absolute paths starting with `/home/runner/work/uuid-playground/uuid-playground/`
- **Dependencies**: All required packages are in package.json, no additional installations needed