<?php
/** خروج از پنل مدیریت */
require dirname(__DIR__) . '/config.php';
do_logout();
redirect(url('admin/login.php'));
