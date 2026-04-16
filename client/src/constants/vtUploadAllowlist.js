/**
 * Keep in sync with server/src/constants/vtUploadAllowlist.js
 */

export const MAX_VT_UPLOAD_BYTES = 32 * 1024 * 1024;

export const ALLOWED_EXTS = new Set([
  'exe', 'dll', 'sys', 'scr', 'com', 'cpl', 'msi', 'msu', 'msp', 'drv', 'ocx', 'ax', 'fon', 'efi',
  'msix', 'appx', 'appxbundle', 'msixbundle',
  'bat', 'cmd', 'ps1', 'psm1', 'psd1', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh', 'msh', 'pif', 'scf',
  'hta', 'lnk', 'inf', 'reg', 'url', 'website', 'desktop',
  'apk', 'dex', 'ipa', 'aab', 'xapk',
  'deb', 'rpm', 'pkg', 'dmg', 'app',
  'doc', 'docx', 'dot', 'dotx', 'docm', 'dotm', 'xls', 'xlsx', 'xlsm', 'xlsb', 'ppt', 'pptx', 'pptm',
  'pot', 'potx', 'rtf', 'pdf', 'pub', 'xps', 'oxps', 'odt', 'ods', 'odp', 'odg',
  'zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'tbz2', 'xz', 'txz', 'z', 'lzma', 'cab', 'ace', 'arj',
  'iso', 'img', 'vhd', 'vhdx', 'vmdk', 'hfs', 'udf',
  'eml', 'msg', 'pst', 'ost', 'mbox',
  'html', 'htm', 'mht', 'mhtml', 'xhtml', 'svg', 'xml', 'xaml',
  'jar', 'war', 'ear', 'class', 'jad',
  'py', 'pyc', 'pyo', 'pyw', 'rb', 'php', 'phar', 'asp', 'aspx', 'ashx', 'asmx', 'jsp', 'jspx', 'cfm',
  'cgi', 'pl', 'pm',
  'bin', 'dat', 'tmp', 'log', 'txt', 'csv', 'tsv', 'json', 'sql', 'yaml', 'yml', 'toml', 'cfg', 'ini',
  'so', 'dylib', 'bundle',
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tif', 'tiff', 'ico', 'heic',
  'mp3', 'wav', 'flac', 'mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv', 'mpeg', 'mpg'
]);

export const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-gzip',
  'application/x-tar',
  'application/x-bzip2',
  'application/java-archive',
  'application/vnd.android.package-archive',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-dosexec',
  'application/x-elf',
  'application/x-sharedlib',
  'application/x-mach-binary',
  'application/x-mach-o-executable',
  'application/x-ms-installer',
  'application/vnd.ms-cab-compressed',
  'application/x-msi',
  'application/x-ms-shortcut',
  'text/html',
  'text/plain',
  'text/csv',
  'text/xml',
  'application/xml',
  'application/json',
  'message/rfc822',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/rtf',
  'image/svg+xml',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/x-iso9660-image'
]);

export function getExtension(filename) {
  const base = String(filename || '').split(/[/\\]/).pop() || '';
  const i = base.lastIndexOf('.');
  if (i <= 0 || i === base.length - 1) return '';
  return base.slice(i + 1).toLowerCase();
}

function normalizeMime(fileMime) {
  if (!fileMime || typeof fileMime !== 'string') return '';
  return fileMime.split(';')[0].trim().toLowerCase();
}

export function validateVtFileUpload(fileName, byteSize, fileMime) {
  if (typeof byteSize !== 'number' || Number.isNaN(byteSize) || byteSize <= 0) {
    return { ok: false, error: 'The file is empty or could not be read.' };
  }
  if (byteSize > MAX_VT_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File is too large for VirusTotal standard upload (max ${MAX_VT_UPLOAD_BYTES / (1024 * 1024)} MB).`
    };
  }

  const ext = getExtension(fileName);
  const mime = normalizeMime(fileMime);
  const extOk = Boolean(ext && ALLOWED_EXTS.has(ext));
  const mimeOk = Boolean(mime && ALLOWED_MIMES.has(mime));

  if (extOk || mimeOk) {
    return { ok: true };
  }

  const extLabel = ext ? `.${ext}` : 'unknown or missing extension';
  return {
    ok: false,
    error: `This file type is not supported for VirusTotal scanning (${extLabel}). Use executables, documents, archives, email packages, scripts, or common media, up to ${MAX_VT_UPLOAD_BYTES / (1024 * 1024)} MB.`
  };
}

export function vtAcceptAttribute() {
  return Array.from(ALLOWED_EXTS)
    .map((e) => `.${e}`)
    .join(',');
}
