/* Copyright (C) 2017 [Gobierno de Espana]
 * This file is part of FIRe.
 * FIRe is free software; you can redistribute it and/or modify it under the terms of:
 *   - the GNU General Public License as published by the Free Software Foundation;
 *     either version 2 of the License, or (at your option) any later version.
 *   - or The European Software License; either version 1.1 or (at your option) any later version.
 * Date: 08/09/2017
 * You may contact the copyright holder at: soporte.afirma@correo.gob.es
 */
package es.gob.fire.server.services.storage;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLDecoder;
import java.util.Hashtable;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import es.gob.fire.server.services.internal.TempDocumentsManager;


/** Servicio de almacenamiento temporal de firmas. &Uacute;til para servir de intermediario en comunicaci&oacute;n
 * entre JavaScript y <i>Apps</i> m&oacute;viles nativas.
 * @author Tom&aacute;s Garc&iacute;a-;er&aacute;s */
public final class StorageService extends HttpServlet {

	private static final long serialVersionUID = -3272368448371213403L;

	/** Codificaci&oacute;n de texto. */
	private static final String DEFAULT_ENCODING = "utf-8"; //$NON-NLS-1$

	/** Log para registrar las acciones del servicio. */
	private static final Logger LOGGER = Logger.getLogger(StorageService.class.getName());

	/** Nombre del par&aacute;metro con la operaci&oacute;n realizada. */
	private static final String PARAMETER_NAME_OPERATION = "op"; //$NON-NLS-1$

	/** Nombre del par&aacute;metro con el identificador del fichero temporal. */
	private static final String PARAMETER_NAME_ID = "id"; //$NON-NLS-1$

	/** Nombre del par&aacute;metro con la versi&oacute;n de la sintaxis de petici&oacute; utilizada. */
	private static final String PARAMETER_NAME_SYNTAX_VERSION = "v"; //$NON-NLS-1$

	/** Nombre del par&aacute;metro con los datos a firmar. */
	private static final String PARAMETER_NAME_DATA = "dat"; //$NON-NLS-1$

	private static final String OPERATION_STORE = "put"; //$NON-NLS-1$
	private static final String SUCCESS = "OK"; //$NON-NLS-1$

	@Override
	protected void service(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {

		LOGGER.fine(" == INICIO GUARDADO == "); //$NON-NLS-1$

		// Leemos la entrada
		int n;
		final byte[] buffer = new byte[1024];
		final ByteArrayOutputStream baos = new ByteArrayOutputStream();
		final ServletInputStream sis = request.getInputStream();
		while ((n = sis.read(buffer)) > 0) {
			baos.write(buffer, 0, n);
		}
		baos.close();
		sis.close();

		// Separamos los parametros y sus valores
		final Hashtable<String, String> params = new Hashtable<>();
		final String[] urlParams = new String(baos.toByteArray()).split("&"); //$NON-NLS-1$
		for (final String param : urlParams) {
			final int equalsPos = param.indexOf('=');
			if (equalsPos != -1) {
				params.put(param.substring(0, equalsPos), param.substring(equalsPos + 1));
			}
		}

		final String operation = params.get(PARAMETER_NAME_OPERATION);
		final String syntaxVersion = params.get(PARAMETER_NAME_SYNTAX_VERSION);
		response.setHeader("Access-Control-Allow-Origin", "*"); //$NON-NLS-1$ //$NON-NLS-2$
		response.setContentType("text/plain"); //$NON-NLS-1$
		response.setCharacterEncoding("utf-8"); //$NON-NLS-1$

		final PrintWriter out = response.getWriter();
		if (operation == null) {
			LOGGER.warning("No se ha indicado codigo de operacion"); //$NON-NLS-1$
			out.println(ErrorManager.genError(ErrorManager.ERROR_MISSING_OPERATION_NAME));
			out.flush();
			return;
		}
		if (syntaxVersion == null) {
			LOGGER.warning("No se ha indicado la version del formato de llamada"); //$NON-NLS-1$
			out.println(ErrorManager.genError(ErrorManager.ERROR_MISSING_SYNTAX_VERSION));
			out.flush();
			return;
		}

		if (OPERATION_STORE.equalsIgnoreCase(operation)) {
			storeSign(out, params);
		} else {
			out.println(ErrorManager.genError(ErrorManager.ERROR_UNSUPPORTED_OPERATION_NAME));
		}
		out.flush();
		LOGGER.fine("== FIN DEL GUARDADO =="); //$NON-NLS-1$
	}

	/**
	 * Almacena una firma en servidor.
	 * @param response Respuesta a la petici&oacute;n.
	 * @param request Petici&oacute;n.
	 * @throws IOException Cuando ocurre un error al general la respuesta.
	 */
	private static void storeSign(final PrintWriter out, final Hashtable<String, String> params) throws IOException {

		final String id = params.get(PARAMETER_NAME_ID);
		if (id == null) {
			LOGGER.severe(ErrorManager.genError(ErrorManager.ERROR_MISSING_DATA_ID));
			out.println(ErrorManager.genError(ErrorManager.ERROR_MISSING_DATA_ID));
			return;
		}

		LOGGER.fine("Se solicita guardar un fichero con el identificador: " + id); //$NON-NLS-1$

		// Si no se indican los datos, se transmite el error en texto plano a traves del fichero generado
		String dataText = URLDecoder.decode(params.get(PARAMETER_NAME_DATA), DEFAULT_ENCODING);
		if (dataText == null) {
			LOGGER.severe(ErrorManager.genError(ErrorManager.ERROR_MISSING_DATA));
			dataText = ErrorManager.genError(ErrorManager.ERROR_MISSING_DATA);
		}

		try {
			TempDocumentsManager.storeDocument(id, dataText.getBytes(), true);
		} catch (final IOException e) {
			LOGGER.log(Level.SEVERE, "Error al guardar el temporal para la comunicacion con el Cliente @firma", e); //$NON-NLS-1$
			out.println(ErrorManager.genError(ErrorManager.ERROR_COMMUNICATING_WITH_WEB));
			return;
		}

		out.print(SUCCESS);
	}
}