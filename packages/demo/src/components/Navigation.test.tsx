import { describe, test, expect } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Navigation } from './Navigation';

describe('Navigation Component', () => {
  const mockProps = {
    showPrimaryNav: true,
    setShowPrimaryNav: () => {},
    selectedDocument: '/001.docx',
    setSelectedDocument: () => {},
    uploadedFile: null,
    setUploadedFile: () => {},
    handleDocumentLoad: () => {},
    handleFileUpload: () => {},
    sampleDocuments: [
      { id: '001.docx', title: 'Service Agreement Template' },
      { id: '002.docx', title: 'Employee Handbook' },
    ],
    getBasePath: () => '',
    viewMode: 'print' as const,
    setViewMode: () => {},
    printScale: 1,
    setPrintScale: () => {},
    result: 'Test content',
    wordCount: 100,
    documentTitle: 'Test Document',
    parsedDocument: null,
    structuredDocument: null,
  };

  test('document selector should be visible on all screen sizes', () => {
    render(<Navigation {...mockProps} />);
    
    const documentSelect = screen.getByLabelText(/document/i);
    expect(documentSelect).toBeDefined();
    
    // Check that the select element is not hidden
    const selectContainer = documentSelect.closest('div');
    expect(selectContainer?.className).not.toContain('hidden');
  });

  test('document selector should contain all sample documents', () => {
    render(<Navigation {...mockProps} />);
    
    const documentSelect = screen.getByLabelText(/document/i) as HTMLSelectElement;
    const options = Array.from(documentSelect.options);
    
    // Should have all sample documents
    expect(options.length).toBe(mockProps.sampleDocuments.length);
    
    // Check each option
    mockProps.sampleDocuments.forEach((doc, index) => {
      expect(options[index].text).toContain(doc.id);
      expect(options[index].text).toContain(doc.title);
    });
  });

  test('document selector should be responsive', () => {
    render(<Navigation {...mockProps} />);
    
    const documentSelect = screen.getByLabelText(/document/i);
    const selectElement = documentSelect as HTMLSelectElement;
    
    // Check responsive classes
    expect(selectElement.className).toContain('max-w-[120px]');
    expect(selectElement.className).toContain('sm:max-w-[200px]');
    expect(selectElement.className).toContain('lg:max-w-[250px]');
  });
});