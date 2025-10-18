# Patient Import Feature Documentation

## Overview

The Patient Import feature allows users to bulk import patient data from CSV files into the LabsToGo SMS system. This comprehensive solution provides data validation, duplicate detection, progress tracking, and detailed import results.

## Architecture

### Component Hierarchy

```
PatientImportPage
├── PatientImport (Main Component)
│   ├── File Upload Area (Drag & Drop)
│   ├── Import Options Panel
│   ├── Progress Tracker
│   ├── Error Display
│   └── Results Summary
├── usePatientImport (Custom Hook)
├── Patient Import API (/api/patients/import)
└── Utility Functions (patientImport.ts)
```

### Data Flow

```
CSV File → Validation → Duplicate Detection → Database Insert/Update → Results
    ↓           ↓              ↓                    ↓              ↓
  Upload    Parse CSV    Check Existing      Process Records   Display
  Progress   Errors      Patients           Batch Import      Summary
```

## Features

### ✅ Core Functionality

- **CSV File Upload**: Drag-and-drop interface with file validation
- **Data Validation**: Phone number, email, and field length validation
- **Duplicate Detection**: Identifies existing patients by phone number
- **Import Options**: Configurable import behavior
- **Progress Tracking**: Real-time import progress with status updates
- **Error Handling**: Comprehensive error reporting and validation
- **Results Display**: Detailed import summary with statistics

### ✅ Advanced Features

- **Batch Processing**: Configurable batch sizes for large imports
- **Update Existing**: Option to update existing patient records
- **Skip Duplicates**: Option to skip duplicate phone numbers
- **Validation Toggles**: Enable/disable phone and email validation
- **Sample Template**: Downloadable CSV template with sample data
- **Import History**: Track previous imports and statistics
- **Error Export**: Export validation errors and duplicates to CSV

## API Endpoints

### POST /api/patients/import

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: CSV file
  - `options`: JSON string with import options

**Response:**

```typescript
{
  success: boolean;
  data: ImportResult;
  timestamp: string;
}
```

**ImportResult:**

```typescript
interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
  duplicates: DuplicateInfo[];
  summary: ImportSummary;
}
```

## CSV Format

### Required Fields

- `phone_number`: Patient's phone number (required)

### Optional Fields

- `first_name`: Patient's first name
- `last_name`: Patient's last name
- `email`: Patient's email address
- `company`: Patient's company/organization

### Sample CSV

```csv
phone_number,first_name,last_name,email,company
+1-555-0101,John,Smith,john.smith@example.com,TechCorp Inc
+1-555-0102,Sarah,Johnson,sarah.j@example.com,HealthPlus Medical
+1-555-0103,Mike,Chen,mike.chen@example.com,RetailMax Stores
```

## Import Options

| Option                 | Description                               | Default |
| ---------------------- | ----------------------------------------- | ------- |
| `skipDuplicates`       | Skip records with duplicate phone numbers | `true`  |
| `updateExisting`       | Update existing patient records           | `false` |
| `validatePhoneNumbers` | Validate phone number format              | `true`  |
| `validateEmails`       | Validate email address format             | `true`  |
| `batchSize`            | Number of records to process per batch    | `100`   |

## Validation Rules

### Phone Numbers

- Required field
- Must contain at least 10 digits
- Supports international format with country codes
- Normalized for duplicate detection

### Email Addresses

- Optional field
- Must follow standard email format
- Validation can be disabled via options

### Names

- First name: Maximum 100 characters
- Last name: Maximum 100 characters
- Company: Maximum 200 characters

## Error Handling

### Validation Errors

- Missing required fields
- Invalid phone number format
- Invalid email format
- Field length violations
- CSV parsing errors

### Processing Errors

- Database connection issues
- Duplicate constraint violations
- File upload failures
- Server errors

### Error Display

- Row-by-row error reporting
- Field-specific error messages
- Exportable error reports
- Visual error indicators

## Usage Examples

### Basic Import

```typescript
const file = new File([csvContent], "patients.csv", { type: "text/csv" });
const options = {
  skipDuplicates: true,
  updateExisting: false,
  validatePhoneNumbers: true,
  validateEmails: true,
  batchSize: 100,
};

await importPatients(file, options);
```

### Advanced Import with Custom Options

```typescript
const options = {
  skipDuplicates: false,
  updateExisting: true,
  validatePhoneNumbers: true,
  validateEmails: false,
  batchSize: 50,
};

await importPatients(file, options);
```

## Testing

### Test Coverage

- ✅ Component rendering and interactions
- ✅ File upload and validation
- ✅ Import options handling
- ✅ Progress tracking
- ✅ Error display and handling
- ✅ Results display
- ✅ Utility function validation
- ✅ API endpoint testing

### Test Files

- `__tests__/components/patients/PatientImport.test.tsx`
- `__tests__/lib/patientImport.test.ts`
- `__tests__/api/patients/import.test.ts`

## Performance Considerations

### File Size Limits

- Maximum file size: 10MB
- Recommended batch size: 100-500 records
- Progress updates every batch completion

### Database Optimization

- Batch inserts for better performance
- Indexed phone number lookups
- Transaction-based processing

### Memory Management

- Streaming CSV parsing
- Batch processing to limit memory usage
- Cleanup of temporary data

## Security Considerations

### File Validation

- CSV file type validation
- File size limits
- Content sanitization

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection in error messages

### Access Control

- Authentication required
- Role-based access (if implemented)
- Audit logging for imports

## Troubleshooting

### Common Issues

**File Upload Fails**

- Check file size (max 10MB)
- Ensure file is CSV format
- Verify network connection

**Validation Errors**

- Check phone number format
- Verify email addresses
- Ensure required fields are present

**Import Fails**

- Check database connection
- Verify Supabase credentials
- Review server logs

**Performance Issues**

- Reduce batch size
- Check database performance
- Monitor server resources

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` to see detailed error information.

## Future Enhancements

### Planned Features

- [ ] Excel file support (.xlsx)
- [ ] Real-time import progress via WebSocket
- [ ] Import scheduling
- [ ] Advanced duplicate resolution
- [ ] Data mapping configuration
- [ ] Import templates
- [ ] Bulk operations on imported data

### Integration Opportunities

- [ ] Queue system integration for large imports
- [ ] Email notifications for import completion
- [ ] Audit trail for import history
- [ ] Data quality scoring
- [ ] Automated data cleansing

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

**Last Updated**: 2025-01-25  
**Version**: 1.0.0  
**Status**: Production Ready
