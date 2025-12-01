import eslint from '@eslint/js';
import stylistic from "@stylistic/eslint-plugin";
import perfectionist from 'eslint-plugin-perfectionist';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import typescript from 'typescript-eslint';

const jsRules = {
    '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
    '@stylistic/arrow-parens': [ 'error', 'always' ],
    '@stylistic/block-spacing': [ 'error', 'always' ],
    '@stylistic/brace-style': [
        'error',
        'stroustrup',
        {
            'allowSingleLine': false,
        },
    ],
    '@stylistic/comma-dangle': [
        'error',
        {
            'arrays': 'always-multiline',
            'exports': 'always-multiline',
            'functions': 'never',
            'imports': 'always-multiline',
            'objects': 'always-multiline',
        },
    ],
    '@stylistic/eol-last': [ 'error', 'always' ],
    '@stylistic/indent': [
        'error',
        4,
        {
            'ignoreComments': false,
            'MemberExpression': 1,
            'SwitchCase': 1,
        },
    ],
    '@stylistic/keyword-spacing': 'error',
    '@stylistic/linebreak-style': [ 'off', 'unix' ],
    '@stylistic/lines-between-class-members': [ 'error', {
        enforce: [
            // Always newline betweeen methods
            {
                blankLine: 'always',
                next: 'method',
                prev: '*',
            },
        ],
    } ],
    '@stylistic/max-len': [
        'off',
        {
            'code': 120,
            'ignoreStrings': true,
        },
    ],
    '@stylistic/multiline-ternary': [ 'error', 'always' ],
    '@stylistic/newline-per-chained-call': [ 'error', { ignoreChainWithDepth: 3 } ],
    '@stylistic/object-curly-spacing': [ 'error', 'always' ],
    '@stylistic/padded-blocks': [ 'error', { blocks: 'never' } ],
    '@stylistic/padding-line-between-statements': [ 'error',
        // Always put a newline before directives
        {
            blankLine: 'always',
            next: 'directive',
            prev: '*',
        },
        // Always put a newline after import statements
        {
            blankLine: 'always',
            next: '*',
            prev: 'import',
        },
        {
            blankLine: 'any',
            next: 'import',
            prev: 'import',
        },
        // Always put a newline between export statements
        {
            blankLine: 'always',
            next: 'export',
            prev: 'block-like',
        },
        // Always put a newline before express statements
        {
            blankLine: 'always',
            next: 'expression',
            prev: [ 'block-like' ],
            // prev: '*',
        },
        // Always put a newline before try...catch statements
        {
            blankLine: 'always',
            next: 'try',
            prev: '*',
        },
        // Always put a newline before class declarations
        {
            blankLine: 'always',
            next: 'class',
            prev: '*',
        },
        // Always put a newline before return after any statement
        {
            blankLine: 'always',
            next: 'return',
            prev: '*',
        },
        // Always put a newline before any statement after sequences of const, let, or var
        {
            blankLine: 'always',
            next: '*',
            prev: [ 'const', 'let', 'var' ],
        },
        {
            blankLine: 'always',
            next: [ 'const', 'let', 'var' ],
            prev: '*',
        },
        {
            blankLine: 'any',
            next: [ 'const', 'let', 'var' ],
            prev: [ 'const', 'let', 'var' ],
        },
        // Always put a newline before block-like statements
        {
            blankLine: 'always',
            next: 'block-like',
            prev: '*',
        },
        // Always put a newline before interfaces, enums, types
        {
            blankLine: "always",
            next: [ "enum", "interface", "type" ],
            prev: "*",
        },
        // Do not put a newline before function overloads
        {
            blankLine: "never",
            next: "function",
            prev: "function-overload",
        },
    ],
    '@stylistic/semi': [ 'error', 'always' ],
    '@stylistic/space-before-blocks': [ 'error', 'always' ],
    '@stylistic/space-before-function-paren': [ 'error', 'always' ],
    'arrow-body-style': [ 'error', 'always' ],
    'curly': 'error',
    'no-multiple-empty-lines': [ 'error', {
        max: 2,
        maxBOF: 0,
        maxEOF: 1,
    } ],
    'no-param-reassign': 'error',
    'no-return-assign': 'error',
    'no-unused-vars': 'error',
    'no-useless-escape': 'error',
    'perfectionist/sort-array-includes': [ 'error', {
        groups: [
            'spread',
            'literal',
        ],
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-classes': [ 'error', {
        groups: [
            'index-signature',
            'property',
            'accessor-property',
            'constructor',
            'static-block',
            'get-method',
            'set-method',
            'method',
        ],
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-decorators': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-exports': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-heritage-clauses': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-imports': [ 'error', {
        // TODO: update to match aliases
        customGroups: [
            {
                elementNamePattern: '^@vitestConstants/.+',
                groupName: 'vitestConstants',
                order: 'asc',
                type: 'alphabetical',
            },
            {
                elementNamePattern: '^@base/.+',
                groupName: 'base-components',
                order: 'asc',
                type: 'alphabetical',
            },
            {
                elementNamePattern: '^@interfaces/.+',
                groupName: 'interfaces',
                order: 'asc',
                type: 'alphabetical',
            },
            {
                elementNamePattern: '^@stores/.+',
                groupName: 'stores',
                order: 'asc',
                type: 'alphabetical',
            },
            {
                elementNamePattern: '^@composables/.+',
                groupName: 'composables',
                order: 'asc',
                type: 'alphabetical',
            },
            {
                elementNamePattern: '^@smart/.+',
                groupName: 'smart-components',
                order: 'asc',
                type: 'alphabetical',
            },
            {
                elementNamePattern: '^@styles/.+',
                groupName: 'public-styles',
                order: 'asc',
                type: 'alphabetical',
            },
            {
                elementNamePattern: '^@privateStyles/.+',
                groupName: 'private-styles',
                order: 'asc',
                type: 'alphabetical',
            },
        ],
        environment: 'node',
        fallbackSort: {
            type: 'unsorted',
        },
        // TODO: update to match aliases in alphabetical order
        groups: [
            'builtin',
            'external',
            [ 'internal', 'parent', 'subpath', 'sibling' ],
            'vitestConstants',
            'interfaces',
            'stores',
            'composables',
            'smart-components',
            'base-components',
            [ 'private-styles', 'public-styles', 'style' ],
            [ 'side-effect', 'side-effect-style' ],
            'type',
        ],
        ignoreCase: true,
        order: 'asc',
        partitionByComment: true,
        specialCharacters: 'keep',
        tsconfig: {
            rootDir: ".",
        },
        type: 'alphabetical',
    } ],
    'perfectionist/sort-interfaces': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-maps': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-named-exports': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-named-imports': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-objects': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-sets': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-switch-case': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-variable-declarations': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'prefer-object-spread': 'error',
};
const tsRules = {
    ...jsRules,
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-vars': 'off',
    'perfectionist/sort-enums': [ 'error', {
        order: 'asc',
        sortByValue: false,
        type: 'alphabetical',
    } ],
    'perfectionist/sort-interfaces': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-intersection-types': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-object-types': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
    'perfectionist/sort-union-types': [ 'error', {
        order: 'asc',
        type: 'alphabetical',
    } ],
};
const globalConfig = defineConfig({
    languageOptions: {
        ecmaVersion: 2022,
        globals: {
            ...globals.browser,
        },
        sourceType: 'module',
    },
    linterOptions: {
        noInlineConfig: false,
    },
});
const tsConfig = defineConfig([
    eslint.configs.recommended,
    typescript.configs.recommended,
    {
        files: [ '**/*.{js,mjs,cjs,ts}' ],
        plugins: {
            '@stylistic': stylistic,
            perfectionist,
        },
        rules: {
            ...tsRules,
        },
    },
]);

export default [
    // https://github.com/eslint/eslint/discussions/18304
    // This is one of ESLint's most poor implementations, but the summary
    // is global ignores need to be in their OWN config object and put
    // at the top level, which is here
    {
        ignores: [
            '**/dist/**/*',
            '**/node_modules/**/*',
        ],
    },

    ...globalConfig,
    ...tsConfig,

    // Overrides
    // Enable inline ESLint config rule for selected file
    // {
    //     files: [],
    //     linterOptions: {
    //         noInlineConfig: false,
    //     },
    // },
];

