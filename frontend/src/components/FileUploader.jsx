
import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Upload, File, X } from "lucide-react";

const FileUploader = ({ 
  acceptedTypes, 
  maxSize, 
  onFileSelect, 
  selectedFile, 
  placeholder 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  }, []);

  const handleFileSelection = (file) => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`Please select a ${acceptedTypes} file`);
      return;
    }

    // Check file size (maxSize is in MB)
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <Card className="p-4 border-2 border-green-200 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-800">{selectedFile.name}</p>
              <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1 hover:bg-green-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-green-600" />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-all cursor-pointer hover:border-blue-400 ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById(`file-input-${acceptedTypes}`).click()}
    >
      <input
        id={`file-input-${acceptedTypes}`}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className="text-center">
        <Upload className={`mx-auto h-12 w-12 mb-4 ${
          isDragActive ? "text-blue-500" : "text-gray-400"
        }`} />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {placeholder}
        </p>
        <p className="text-sm text-gray-500">
          Supports {acceptedTypes} files up to {maxSize}MB
        </p>
      </div>
    </Card>
  );
};

export default FileUploader;
