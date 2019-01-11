<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');

$file = 'uploads/1547013241449.jpg';
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="'.basename($file).'"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($file));
readfile($file);
exit;

?>