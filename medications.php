<?php
/*
CREATE TABLE medications (
    med_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    dosage_form VARCHAR(20) NOT NULL,
    strength VARCHAR(20) NOT NULL,
    prescribed_qty INT NOT NULL,
    instructions TEXT,
    start_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);
*/
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE"); // Add DELETE method
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$db = "health_db";
$port = "3306";
$user = "root";
$pass = "root";
$charset = "utf8mb4";
/*
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
*/
try {
    // $pdo = new PDO($dsn, $user, $pass, $options);
    
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=$charset",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    
    // Connection successful
    //echo "Connected successfully to MySQL on port $port";

    // Handle GET request (fetch all medications)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT * FROM medications WHERE active = 1");
        echo json_encode($stmt->fetchAll());
    }
    
    // Handle POST request (add new medication)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("INSERT INTO medications 
            (name, dosage_form, strength, prescribed_qty, instructions, start_date) 
            VALUES (?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $input['name'],
            $input['dosage_form'],
            $input['strength'],
            $input['prescribed_qty'],
            $input['instructions'],
            $input['start_date']
        ]);
        
        echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId()]);
    }

    // Handle DELETE request
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        try {
            // Get medication ID from URL
            $medId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            
            if ($medId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid medication ID']);
                exit;
            }

            // Soft delete (recommended)
            $stmt = $pdo->prepare("UPDATE medications SET active = 0 WHERE med_id = ?");
            $stmt->execute([$medId]);
            
            // Check if any row was affected
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Medication deleted']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Medication not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        exit;
    }

// Your existing GET and POST handlers below...
// ...

} catch (PDOException $e) {
    //http_response_code(500);
    //echo json_encode(['error' => $e->getMessage()]);
    die("Connection failed: " . $e->getMessage() . 
    " (Attempted to connect to host: $host, port: $port)");
}

// Handle PUT request (update medication)
// Add PUT handler (for updates)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!isset($input['med_id']) || !is_numeric($input['med_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid medication ID']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE medications SET 
            name = :name,
            dosage_form = :dosage_form,
            strength = :strength,
            prescribed_qty = :prescribed_qty,
            instructions = :instructions,
            start_date = :start_date,
            active = :active
            WHERE med_id = :med_id");
        
        $stmt->execute([
            ':name' => $input['name'],
            ':dosage_form' => $input['dosage_form'],
            ':strength' => $input['strength'],
            ':prescribed_qty' => $input['prescribed_qty'],
            ':instructions' => $input['instructions'] ?? null,
            ':start_date' => $input['start_date'],
            ':active' => $input['active'] ?? 1,
            ':med_id' => $input['med_id']
        ]);
        
        echo json_encode(['status' => 'success', 'message' => 'Medication updated']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

?>