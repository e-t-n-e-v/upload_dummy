<?php
header('Access-Control-Allow-Origin: *');
$target_path = "uploads/";
 
$target_path = $target_path . basename( $_FILES['file']['name']);
 header('Content-type: application/json');
try{
	move_uploaded_file($_FILES['file']['tmp_name'], $target_path);
	    $data = ['success' => true, 'message' => 'Upload and move success'];
	    echo json_encode( $data );

	    // var_dump($_FILES['file']['tmp_name'], $target_path);
    
}catch(Exception $e)
{
    $data = $e;
    echo json_encode( $data->getMessage() );
}
 
?>