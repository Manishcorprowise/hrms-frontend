import { Dialog, DialogActions, Button } from "@mui/material";
import React, { useMemo } from "react";

export const Base64FilePreview = ({ base64Data, fileName, open, onClose }) => {

  const fileType = useMemo(() => {
    if (!base64Data) return null;
    
    // Handle base64 data URLs
    if (base64Data.startsWith('data:')) {
      const mimeType = base64Data.split(';')[0].split(':')[1].toLowerCase();
      
      if (mimeType.includes('image')) return 'image';
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.includes('video')) return 'video';
      if (mimeType.includes('audio')) return 'audio';
      return 'unsupported';
    }
    
    // Handle raw base64 data (without data URL prefix)
    if (fileName) {
      const extension = fileName
        .split('.')
        .pop()
        .toLowerCase();
      
      // Check file type based on extension
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
        return 'image';
      } else if (extension === 'pdf') {
        return 'pdf';
      } else if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension)) {
        return 'video';
      } else if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) {
        return 'audio';
      }
    }
    
    return 'unsupported';
  }, [base64Data, fileName]);

  const getDataUrl = () => {
    if (!base64Data) return null;
    
    // If it already has data URL prefix, return as is
    if (base64Data.startsWith('data:')) {
      return base64Data;
    }
    
    // If it's raw base64, determine MIME type and add prefix
    if (fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      
      let mimeType = 'application/octet-stream'; // default
      
      if (['jpg', 'jpeg'].includes(extension)) {
        mimeType = 'image/jpeg';
      } else if (extension === 'png') {
        mimeType = 'image/png';
      } else if (extension === 'gif') {
        mimeType = 'image/gif';
      } else if (extension === 'webp') {
        mimeType = 'image/webp';
      } else if (extension === 'svg') {
        mimeType = 'image/svg+xml';
      } else if (extension === 'pdf') {
        mimeType = 'application/pdf';
      } else if (['mp4'].includes(extension)) {
        mimeType = 'video/mp4';
      } else if (['webm'].includes(extension)) {
        mimeType = 'video/webm';
      } else if (['mp3'].includes(extension)) {
        mimeType = 'audio/mpeg';
      } else if (['wav'].includes(extension)) {
        mimeType = 'audio/wav';
      }
      
      return `data:${mimeType};base64,${base64Data}`;
    }
    
    // If no filename, try to detect from base64 content
    return `data:application/octet-stream;base64,${base64Data}`;
  };

  const dataUrl = getDataUrl();

  const renderContent = () => {
    if (!dataUrl) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <p>No file data available</p>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <img 
              src={dataUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <iframe
            src={dataUrl}
            width="100%"
            height="100%"
            style={{
              border: 'none',
              display: 'block'
            }}
          />
        );
      
      case 'video':
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <video 
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <source src={dataUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <audio 
              controls
              style={{
                width: '100%',
                maxWidth: '500px'
              }}
            >
              <source src={dataUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      default:
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <p>File type not supported for preview</p>
            <p>File: {fileName || 'Unknown'}</p>
            <Button 
              variant="contained" 
              onClick={() => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = fileName || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        zIndex: 1400, // Higher than form dialog
        "& .MuiDialog-paper": {
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div style={{ flex: 1, overflow: "hidden" }}>
        {renderContent()}
      </div>
      <DialogActions className="dialog-card-footer">
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        {dataUrl && (
          <Button 
            variant="contained" 
            onClick={() => {
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = fileName || 'download';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
