import type { ReactElement } from 'react';
import { lazy, Suspense } from 'react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { FieldLoading } from './LanguageField';
import type { UploadedFile } from '../../types';

/* ─── Props ─── */

export interface UploadFieldProps {
  field: any;
  name: string;
  id: string;
  value: UploadedFile[];
  onChange: (value: UploadedFile[]) => void;
  readOnly?: boolean;
}

export interface UploadFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label (React element, e.g. Lucide icon) */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  allowMultiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: string;
  maxTotalFileSize?: string;
  folder?: string;
  /** Show uploaded files list with view/download buttons */
  showUploadedFiles?: boolean;
  /** Preview height for images in FilePond */
  imagePreviewHeight?: number;
  /** Allow reorder in FilePond */
  allowReorder?: boolean;
  /** Enable image compression before upload */
  imageCompressionEnabled?: boolean;
  /** Image compression options */
  imageCompressionOptions?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    fileType?: string;
  };
}

/* ─── Lazy Heavy Implementation ─── */

// FilePond + Doka + browser-image-compression are heavy; load them only when
// this field actually renders.
const UploadFieldImpl = lazy(() => import('./UploadField.impl'));

/* ─── Main Component ─── */

/**
 * UploadField — A file upload custom field for Puck.
 * Uses FilePond + the Doka image editor, lazy-loaded behind <Suspense>.
 */
export const UploadField = (props: UploadFieldProps & UploadFieldOptions) => (
  <Suspense fallback={<FieldLoading />}>
    <UploadFieldImpl {...props} />
  </Suspense>
);

UploadField.displayName = 'UploadField';

/* ─── Factory Function (Puck Custom Field) ─── */

export const createUploadField = (options: UploadFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: 'custom' as const,
    _fieldType: 'upload' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: UploadFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <UploadField
            field={field}
            name={name}
            id={id}
            value={value || []}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default UploadField;
