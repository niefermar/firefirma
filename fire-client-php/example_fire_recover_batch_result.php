<html>
 <head>
  <title>Recuperar resultados de la firma del lote de firmas</title>
 </head>
 <body>
 <?php 
	// Cargamos el componente distribuido de FIRe
	include 'fire_client.php';
	
	
	//$appId = "7BA5453995EC";	// Identificador de la aplicacion (dada de alta previamente en el sistema) - PREPRODUCCION
	$appId = "B244E473466F";	// Identificador de la aplicacion (dada de alta previamente en el sistema) - LOCAL
	$subjectId = "00001";		// DNI de la persona
	$transactionId = "1bf458ac-6940-4be9-bd26-86d6ba82f898";	// Identificador de la transaccion
	
	
	$fireClient = new FireClient($appId); // Identificador de la aplicacion (dada de alta previamente en el sistema)
	$batchResult;
	try {
		$batchResult = $fireClient->recoverBatchResult(
			$subjectId,			// DNI de la persona
			$transactionId		// Identificador de transaccion recuperado en la operacion createBatch()
		);
	}
	catch(Exception $e) {
		echo 'Error: ',  $e->getMessage(), "\n";
		return;
	}

	echo "<br><b>Proveedor:</b><br>".$batchResult->providerName;
	echo "<br><b>Certificado:</b><br>".$batchResult->signingCert;

	// Mostramos los datos obtenidos
	foreach ($batchResult->batch as &$batchDocument) {
		echo "<br><b>Identificador de documento:</b><br>".$batchDocument->id;
		echo "<br><b>Estado de la firma:</b><br>".$batchDocument->ok;
		if (!$batchDocument->ok) {
			echo "<br><b>Codigo de error:</b><br>".$batchDocument->dt;
		}
		if (isset($batchDocument->gp)) {
			echo "<br><b>Periodo de gracia:</b><br>ID: ".($batchDocument->gp->id)."<br>Fecha: ".($batchDocument->gp->date->format('Y-m-d H:i:sP'));
		}
	}
	
 ?>
 </body>
</html>