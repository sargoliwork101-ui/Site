<?php
// Tidy "directory index" for /api/ (reveals nothing).
http_response_code(403);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(array('ok' => false, 'error' => 'forbidden'));
