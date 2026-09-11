<?php
// ایندکس پوشه api/: اگه کسی /api/ رو باز کرد فقط 403 خالی ببینه (نه لیست فایل).
// Tidy "directory index" for /api/ (reveals nothing).
http_response_code(403);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(array('ok' => false, 'error' => 'forbidden'));
