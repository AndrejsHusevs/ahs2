<?php

namespace App\Classes;

use PDO;
use PDOException;

class Database {
    
   /*private $host = "localhost";
    private $db_name = "ahs";
    private $username = "root";
    private $password = "";*/

    
    private $host;
    private $db_name;
    private $username;
    private $password;

    public $conn;

    public function __construct() {
        require_once __DIR__ . '/../../graphql/config.php';

        $this->host = DB_HOST;
        $this->db_name = DB_NAME;
        $this->username = DB_USER;
        $this->password = DB_PASS;
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>