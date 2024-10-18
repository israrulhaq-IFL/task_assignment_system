class CustomUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }
  
    upload() {
      return this.loader.file.then(
        file =>
          new Promise((resolve, reject) => {
            const data = new FormData();
            data.append('file', file);
  
            fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/upload`, {
              method: 'POST',
              body: data,
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
            })
              .then(response => response.json())
              .then(result => {
                if (result.error) {
                  return reject(result.error.message);
                }
                resolve({
                  default: result.url
                });
              })
              .catch(error => {
                reject(error.message);
              });
          })
      );
    }
  
    abort() {
      // Handle aborting the upload if necessary
    }
  }
  
  export default function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = loader => {
      return new CustomUploadAdapter(loader);
    };
  }