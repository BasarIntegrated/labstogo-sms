#!/usr/bin/env node

/**
 * Code Quality Automation Script
 * 
 * This script provides deterministic operations for:
 * - Code formatting and linting
 * - Type checking
 * - Test execution
 * - Database migrations
 * - Build validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CodeQualityRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      linting: null,
      typeCheck: null,
      tests: null,
      build: null,
      migrations: null
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runLinting() {
    this.log('Running ESLint...');
    try {
      execSync('npm run lint', { stdio: 'inherit', cwd: this.projectRoot });
      this.results.linting = { success: true, message: 'No linting errors found' };
      this.log('Linting passed', 'success');
    } catch (error) {
      this.results.linting = { success: false, message: error.message };
      this.log('Linting failed', 'error');
      throw error;
    }
  }

  async runTypeCheck() {
    this.log('Running TypeScript type check...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: this.projectRoot });
      this.results.typeCheck = { success: true, message: 'No type errors found' };
      this.log('Type check passed', 'success');
    } catch (error) {
      this.results.typeCheck = { success: false, message: error.message };
      this.log('Type check failed', 'error');
      throw error;
    }
  }

  async runTests() {
    this.log('Running tests...');
    try {
      execSync('npm run test:ci', { stdio: 'inherit', cwd: this.projectRoot });
      this.results.tests = { success: true, message: 'All tests passed' };
      this.log('Tests passed', 'success');
    } catch (error) {
      this.results.tests = { success: false, message: error.message };
      this.log('Tests failed', 'error');
      throw error;
    }
  }

  async runBuild() {
    this.log('Running production build...');
    try {
      execSync('npm run build', { stdio: 'inherit', cwd: this.projectRoot });
      this.results.build = { success: true, message: 'Build successful' };
      this.log('Build passed', 'success');
    } catch (error) {
      this.results.build = { success: false, message: error.message };
      this.log('Build failed', 'error');
      throw error;
    }
  }

  async validateMigrations() {
    this.log('Validating database migrations...');
    try {
      // Check if migration files exist and are properly formatted
      const migrationsDir = path.join(this.projectRoot, 'migrations');
      if (!fs.existsSync(migrationsDir)) {
        throw new Error('Migrations directory not found');
      }

      const migrationDirs = fs.readdirSync(migrationsDir)
        .filter(item => fs.statSync(path.join(migrationsDir, item)).isDirectory())
        .filter(item => item.match(/^\d{3}_/));

      for (const migrationDir of migrationDirs) {
        const upFile = path.join(migrationsDir, migrationDir, 'up.sql');
        const downFile = path.join(migrationsDir, migrationDir, 'down.sql');
        
        if (!fs.existsSync(upFile) || !fs.existsSync(downFile)) {
          throw new Error(`Migration ${migrationDir} missing up.sql or down.sql`);
        }
      }

      this.results.migrations = { success: true, message: `${migrationDirs.length} migrations validated` };
      this.log('Migrations validated', 'success');
    } catch (error) {
      this.results.migrations = { success: false, message: error.message };
      this.log('Migration validation failed', 'error');
      throw error;
    }
  }

  async runAll() {
    this.log('Starting comprehensive code quality check...');
    
    try {
      await this.runLinting();
      await this.runTypeCheck();
      await this.runTests();
      await this.runBuild();
      await this.validateMigrations();
      
      this.log('All quality checks passed!', 'success');
      this.generateReport();
      
    } catch (error) {
      this.log('Code quality check failed', 'error');
      this.generateReport();
      process.exit(1);
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r?.success).length,
        failed: Object.values(this.results).filter(r => r?.success === false).length
      }
    };

    const reportPath = path.join(this.projectRoot, 'quality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Quality report saved to ${reportPath}`);
    this.log(`Summary: ${report.summary.passed}/${report.summary.total} checks passed`);
  }
}

// CLI Interface
if (require.main === module) {
  const runner = new CodeQualityRunner();
  const command = process.argv[2];

  switch (command) {
    case 'lint':
      runner.runLinting();
      break;
    case 'typecheck':
      runner.runTypeCheck();
      break;
    case 'test':
      runner.runTests();
      break;
    case 'build':
      runner.runBuild();
      break;
    case 'migrations':
      runner.validateMigrations();
      break;
    case 'all':
    default:
      runner.runAll();
      break;
  }
}

module.exports = CodeQualityRunner;
