# AST-grep Usage Guide for TypeScript Projects

This guide shows when and how to use AST-grep instead of traditional grep for TypeScript code search and transformation tasks.

## When to Use AST-grep Over Grep

**Use AST-grep when you need to:**
- Find TypeScript/JavaScript patterns based on structure, not just text
- Avoid false positives from comments, strings, or type annotations
- Transform code while preserving formatting and types
- Find complex patterns like "async functions that don't return Promise types"
- Work with JSX, decorators, or modern TypeScript syntax

**Use regular grep when you need to:**
- Search plain text files (README, config files, logs)
- Find simple string patterns across all file types
- Maximum speed for basic text search

## Basic Pattern Syntax for TypeScript

AST-grep patterns look like TypeScript code you're searching for, with meta-variables for wildcards:

```bash
# Find any console.log call
ast-grep -l ts -p 'console.log($MESSAGE)'

# Find React hooks
ast-grep -l tsx -p 'useState($INITIAL)'

# Find async functions
ast-grep -l ts -p 'async function $NAME($$$PARAMS) { $$$BODY }'

# Find type assertions
ast-grep -l ts -p '$EXPR as $TYPE'
```

### Meta-variable Rules

- **Single node**: `$VAR` matches one AST node
- **Multiple nodes**: `$$$ARGS` matches zero or more nodes  
- **Naming**: Must start with `$` followed by UPPERCASE letters/underscores/digits
- **Reuse**: Same variable name matches identical content (`$A == $A`)
- **Suppress capture**: Use `$_VAR` when you don't need to reuse the match

## TypeScript-Specific Search Patterns

### Find Function Patterns

```bash
# Any function call
ast-grep -l ts -p '$FUNC($$$ARGS)'

# Arrow functions
ast-grep -l ts -p '($$$PARAMS) => $BODY'
ast-grep -l ts -p '($$$PARAMS): $TYPE => $BODY'

# Async/await patterns
ast-grep -l ts -p 'async function $NAME($$$PARAMS) { $$$BODY }'
ast-grep -l ts -p 'await $PROMISE'

# Methods in classes
ast-grep -l ts -p '$METHOD($$$PARAMS): $TYPE { $$$BODY }'
```

### Find TypeScript Type Patterns

```bash
# Type annotations
ast-grep -l ts -p '$VAR: $TYPE'
ast-grep -l ts -p 'function $NAME($$$PARAMS): $TYPE { $$$BODY }'

# Type assertions
ast-grep -l ts -p '$EXPR as $TYPE'
ast-grep -l ts -p '<$TYPE>$EXPR'

# Interface definitions
ast-grep -l ts -p 'interface $NAME { $$$PROPS }'

# Generic types
ast-grep -l ts -p '$TYPE<$GENERIC>'
ast-grep -l ts -p 'function $NAME<$T>($$$PARAMS) { $$$BODY }'
```

### Find React/JSX Patterns

```bash
# React hooks
ast-grep -l tsx -p 'useState($INITIAL)'
ast-grep -l tsx -p 'useEffect($CALLBACK, $DEPS)'
ast-grep -l tsx -p 'useMemo($CALLBACK, $DEPS)'

# JSX elements
ast-grep -l tsx -p '<$COMPONENT $$$PROPS />'
ast-grep -l tsx -p '<$COMPONENT $$$PROPS>$$$CHILDREN</$COMPONENT>'

# Component props
ast-grep -l tsx -p 'interface $Props { $$$FIELDS }'
ast-grep -l tsx -p 'type $Props = { $$$FIELDS }'
```

### Find Import/Export Patterns

```bash
# Import statements
ast-grep -l ts -p 'import $DEFAULT from "$MODULE"'
ast-grep -l ts -p 'import { $$$NAMED } from "$MODULE"'
ast-grep -l ts -p 'import * as $NAMESPACE from "$MODULE"'

# Dynamic imports
ast-grep -l ts -p 'import("$MODULE")'

# Export statements
ast-grep -l ts -p 'export { $$$EXPORTS } from "$MODULE"'
ast-grep -l ts -p 'export default $VALUE'
```

## TypeScript Code Transformation Examples

### Type Safety Improvements

```bash
# Remove unnecessary type assertions
ast-grep -l ts -p '$EXPR as any' -r '$EXPR'

# Add explicit return types to functions
ast-grep -l ts -p 'function $NAME($$$PARAMS) { $$$BODY }' -r 'function $NAME($$$PARAMS): void { $$$BODY }'

# Convert var to const
ast-grep -l ts -p 'var $VAR = $VALUE' -r 'const $VAR = $VALUE'

# Add strict null checks
ast-grep -l ts -p '$OBJ.$PROP' -r '$OBJ?.$PROP'
```

### React Hook Transformations

```bash
# Remove unnecessary useState types
ast-grep -l tsx -p 'useState<string>($INITIAL)' -r 'useState($INITIAL)'
ast-grep -l tsx -p 'useState<number>($INITIAL)' -r 'useState($INITIAL)'
ast-grep -l tsx -p 'useState<boolean>($INITIAL)' -r 'useState($INITIAL)'

# Convert class component state to hooks
ast-grep -l tsx -p 'this.setState({ $PROP: $VALUE })' -r 'set$PROP($VALUE)'

# Update effect dependencies
ast-grep -l tsx -p 'useEffect($CALLBACK, [])' -r 'useEffect($CALLBACK, [$$$DEPS])'
```

### Modern TypeScript Features

```bash
# Convert to optional chaining
ast-grep -l ts -p '$OBJ && $OBJ.$PROP' -r '$OBJ?.$PROP'
ast-grep -l ts -p '$OBJ && $OBJ.$METHOD()' -r '$OBJ?.$METHOD?.()'

# Convert to nullish coalescing
ast-grep -l ts -p '$VAL || $DEFAULT' -r '$VAL ?? $DEFAULT'

# Convert Promise.then to async/await
ast-grep -l ts -p '$PROMISE.then($CALLBACK)' -r 'await $PROMISE'
```

### Import/Export Modernization

```bash
# Add .js extensions for ESM
ast-grep -l ts -p 'import $IMPORT from "./$PATH"' -r 'import $IMPORT from "./$PATH.js"'

# Convert require to import
ast-grep -l ts -p 'const $VAR = require("$MODULE")' -r 'import $VAR from "$MODULE"'

# Convert module.exports to export
ast-grep -l ts -p 'module.exports = $VALUE' -r 'export default $VALUE'
```

## Advanced YAML Rules for TypeScript

### Basic TypeScript Rule Structure

```yaml
id: prefer-const
language: TypeScript
rule:
  pattern: let $VAR = $VALUE
  not:
    pattern: $VAR = $_
message: Use 'const' instead of 'let' for variables that are never reassigned
severity: warning
fix: 'const $VAR = $VALUE'
```

### React Hook Rules

```yaml
id: missing-dependency
language: TypeScript
rule:
  pattern: |
    useEffect(() => {
      $$$BODY
    }, [$$$DEPS])
  has:
    pattern: $VAR
    inside:
      pattern: $$$BODY
    not:
      inside:
        pattern: [$$$DEPS]
message: "Missing dependency in useEffect"
severity: error
```

### Type Safety Rules

```yaml
id: no-any-type
language: TypeScript  
rule:
  any:
    - pattern: "$VAR: any"
    - pattern: "function $NAME($$$PARAMS): any { $$$BODY }"
    - pattern: "$EXPR as any"
message: "Avoid using 'any' type"
severity: warning
```

### Async/Await Rules

```yaml
id: missing-await
language: TypeScript
rule:
  pattern: |
    async function $NAME($$$PARAMS) {
      $$$BODY
    }
  not:
    has:
      pattern: await $_
message: "Async function should contain await or return Promise"
severity: warning
```

### JSX/React Rules

```yaml
id: missing-key-prop
language: TypeScript
rule:
  pattern: |
    $ARRAY.map($CALLBACK => (
      <$COMPONENT $$$PROPS />
    ))
  not:
    has:
      pattern: key={$_}
      inside:
        pattern: <$COMPONENT $$$PROPS />
message: "Missing key prop in mapped JSX element"
severity: error
```

## File Organization for TypeScript Projects

```
src/
├── sgconfig.yml          # Main AST-grep configuration
├── .ast-grep/
│   ├── rules/
│   │   ├── react/
│   │   │   ├── hooks-rules.yml
│   │   │   ├── jsx-rules.yml
│   │   │   └── component-rules.yml
│   │   ├── typescript/
│   │   │   ├── type-safety.yml
│   │   │   ├── async-await.yml
│   │   │   └── imports.yml
│   │   └── performance/
│   │       ├── no-sync-operations.yml
│   │       └── optimize-renders.yml
│   └── tests/
│       ├── valid/
│       └── invalid/
├── components/
├── hooks/
├── types/
└── utils/
```

### TypeScript Configuration (sgconfig.yml)

```yaml
ruleDirs:
  - .ast-grep/rules
testConfigs:
  - testDir: .ast-grep/tests
languages:
  - TypeScript
  - TSX
```

## TypeScript-Specific Command Line Usage

### Common TypeScript Searches

```bash
# Find all async functions
ast-grep -l ts -p 'async function $NAME($$$PARAMS) { $$$BODY }' src/

# Find React components
ast-grep -l tsx -p 'function $COMP($PROPS) { return $JSX }' src/components/

# Find type definitions
ast-grep -l ts -p 'type $NAME = $DEFINITION' src/types/

# Find interface definitions  
ast-grep -l ts -p 'interface $NAME { $$$PROPS }' src/

# Find hook usage
ast-grep -l tsx -p 'use$HOOK($$$ARGS)' src/
```

### TypeScript Transformations

```bash
# Update import paths for new file structure
ast-grep -l ts -p 'import $IMPORT from "../utils/$FILE"' -r 'import $IMPORT from "@/utils/$FILE"'

# Convert function components to arrow functions
ast-grep -l tsx -p 'function $COMP($PROPS) { return $JSX }' -r 'const $COMP = ($PROPS) => { return $JSX }'

# Add React.FC types to components
ast-grep -l tsx -p 'const $COMP = ($PROPS) => { $$$BODY }' -r 'const $COMP: React.FC<$PropsType> = ($PROPS) => { $$$BODY }'
```

## Common TypeScript Code Quality Patterns

### Remove Debug Code

```bash
# Remove console statements
ast-grep -l ts -p 'console.log($$$)' -r ''
ast-grep -l ts -p 'console.error($$$)' -r ''
ast-grep -l ts -p 'console.warn($$$)' -r ''

# Remove debugger statements
ast-grep -l ts -p 'debugger' -r ''

# Remove @ts-ignore comments
ast-grep -l ts -p '// @ts-ignore' -r ''
```

### Enforce TypeScript Best Practices

```bash
# Prefer const assertions
ast-grep -l ts -p 'const $VAR = [$$$ITEMS]' -r 'const $VAR = [$$$ITEMS] as const'

# Add explicit return types
ast-grep -l ts -p 'export function $NAME($$$PARAMS) { $$$BODY }' -r 'export function $NAME($$$PARAMS): ReturnType { $$$BODY }'

# Convert to strict equality
ast-grep -l ts -p '$A == $B' -r '$A === $B'
ast-grep -l ts -p '$A != $B' -r '$A !== $B'
```

### React/Next.js Specific

```bash
# Convert to Next.js dynamic imports
ast-grep -l tsx -p 'import $COMP from "$PATH"' -r 'const $COMP = dynamic(() => import("$PATH"))'

# Update old React imports
ast-grep -l tsx -p 'import React, { $$$HOOKS } from "react"' -r 'import { $$$HOOKS } from "react"'

# Convert class components to functional
ast-grep -l tsx -p 'class $COMP extends React.Component { render() { return $JSX } }' -r 'function $COMP() { return $JSX }'
```

## Testing TypeScript Rules

Create test files specific to TypeScript patterns:

```yaml
# tests/prefer-const/invalid.yml
- let count = 0;
- let message = "hello";  
- let config = { debug: true };

# tests/prefer-const/valid.yml
- const count = 0;
- let count = 0; count = 1;  # reassigned
- const message = "hello";
```

Run tests:
```bash
ast-grep test
```

## Performance Tips for TypeScript Projects

1. **Target specific directories**:
   ```bash
   ast-grep -l ts -p 'pattern' src/components/ src/hooks/
   ```

2. **Use file extensions**:
   ```bash
   ast-grep -l ts -p 'pattern' **/*.ts **/*.tsx
   ```

3. **Exclude build outputs**:
   ```bash
   ast-grep -l ts -p 'pattern' --no-ignore src/
   ```

## Debugging TypeScript Patterns

When patterns don't work:

1. **Test in playground** with TypeScript language selected
2. **Check AST structure**:
   ```bash
   ast-grep -l ts --debug-query -p 'your_pattern' file.ts
   ```

3. **Use pattern objects for complex TypeScript syntax**:
   ```yaml
   pattern:
     context: 'class Component { @decorator method() { return value; } }'
     selector: method_definition
   ```

4. **Handle TypeScript-specific ambiguities**:
   ```yaml
   # For JSX vs type assertion conflicts
   pattern:
     context: 'const jsx = <Component prop="value" />'
     selector: jsx_element
   ```

This TypeScript-focused guide provides practical examples for the most common patterns you'll encounter in modern TypeScript/React projects, helping Claude Code understand when AST-grep's structural approach is superior to text-based grep for TypeScript codebases.
