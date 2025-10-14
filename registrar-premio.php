<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = $input['email'] ?? '';
    $premio = $input['premio'] ?? '';
    $timestamp = $input['timestamp'] ?? date('c');
    
    // Validar datos
    if (empty($email) || empty($premio)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email y premio son requeridos']);
        exit;
    }
    
    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email inválido']);
        exit;
    }
    
    // Crear registro
    $registro = [
        'id' => time(),
        'email' => $email,
        'premio' => $premio,
        'timestamp' => $timestamp,
        'fecha_registro' => date('Y-m-d H:i:s')
    ];
    
    // Guardar en archivo (en producción usarías base de datos)
    $archivo = 'premios.json';
    $premios = [];
    
    if (file_exists($archivo)) {
        $premios = json_decode(file_get_contents($archivo), true) ?: [];
    }
    
    $premios[] = $registro;
    file_put_contents($archivo, json_encode($premios, JSON_PRETTY_PRINT));
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Premio registrado exitosamente',
        'premio' => $registro
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
