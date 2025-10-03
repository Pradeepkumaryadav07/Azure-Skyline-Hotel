<?php
header('Content-Type: application/json');

// Validate and sanitize input
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

// Basic validation
$errors = [];
if (empty($name)) $errors[] = 'Name is required';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required';
if (empty($message)) $errors[] = 'Message is required';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Email configuration (update these values)
$to = 'your-email@example.com';
$email_subject = "New Contact Form Submission: " . htmlspecialchars($subject);
$email_body = "You have received a new message from your website contact form.\n\n".
              "Name: $name\n".
              "Email: $email\n".
              "Phone: $phone\n\n".
              "Subject: $subject\n\n".
              "Message:\n$message";
$headers = "From: $email\r\n".
           "Reply-To: $email\r\n".
           'X-Mailer: PHP/' . phpversion();

// Send email
$mail_sent = mail($to, $email_subject, $email_body, $headers);

if ($mail_sent) {
    echo json_encode(['success' => true, 'message' => 'Thank you! Your message has been sent.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Oops! Something went wrong. Please try again later.']);
}
?>
