/* Copyright (C) 2017 [Gobierno de Espana]
 * This file is part of FIRe.
 * FIRe is free software; you can redistribute it and/or modify it under the terms of:
 *   - the GNU General Public License as published by the Free Software Foundation;
 *     either version 2 of the License, or (at your option) any later version.
 *   - or The European Software License; either version 1.1 or (at your option) any later version.
 * Date: 08/09/2017
 * You may contact the copyright holder at: soporte.afirma@correo.gob.es
 */
package es.gob.fire.client;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Manejador para la obtenci&oacute;n de los valores del fichero de configuraci&oacute;n.
 */
public class ConfigManager {

	private static final String PROPERTY_FILE = "client_config.properties";//$NON-NLS-1$


	/** Variable de entorno que determina el directorio en el que buscar el fichero
	 * de configuraci&oacute;n. */
	private static final String ENVIRONMENT_VAR_CONFIG_DIR = "fire.config.path"; //$NON-NLS-1$

	/** Variable de entorno antigua que determinaba el directorio en el que buscar el fichero
	 * de configuraci&oacute;n. Se utiliza si no se ha establecido la nueva variable. */
	private static final String ENVIRONMENT_VAR_CONFIG_DIR_OLD = "clavefirma.config.path"; //$NON-NLS-1$

	private static final Logger LOGGER = LoggerFactory.getLogger(ConfigManager.class);

	private static Properties config = null;

	/**
	 * Carga el fichero de configuraci&oacute;n del m&oacute;dulo o lo devuelve directamente si ya
	 * tuviese cargado.
	 * @return Propiedades de fichero de configuraci&oacute;n.
	 * @throws ClientConfigFilesNotFoundException
	 * 			Si no se encuentra o no se puede cargar el fichero de configuraci&oacute;n.
	 */
	public static Properties loadConfig() throws ClientConfigFilesNotFoundException {

		if (config != null) {
			return config;
		}

		InputStream is = null;
		config = new Properties();
		try {
			String configDirPath = System.getProperty(ENVIRONMENT_VAR_CONFIG_DIR);
			if (configDirPath == null) {
				configDirPath = System.getProperty(ENVIRONMENT_VAR_CONFIG_DIR_OLD);
			}
			if (configDirPath != null) {
				final File configDir = new File(configDirPath).getCanonicalFile();
				final File configFile = new File(configDir, PROPERTY_FILE).getCanonicalFile();
				if (!configFile.isFile() || !configFile.canRead() || !configDir.equals(configFile.getParentFile())) {
					LOGGER.warn(
							"No se encontro el fichero {} en el directorio configurado en la variable {}: {}\n" + //$NON-NLS-1$
							"Se buscara en el CLASSPATH", PROPERTY_FILE, ENVIRONMENT_VAR_CONFIG_DIR, configDir.getAbsolutePath()); //$NON-NLS-1$
				}
				else {
					is = new FileInputStream(configFile);
					LOGGER.info("Se carga un fichero de configuracion externo: {}", configFile.getAbsolutePath()); //$NON-NLS-1$
				}
			}

			if (is == null) {
				is = ConfigManager.class.getResourceAsStream('/' + PROPERTY_FILE);
				LOGGER.info("Se carga el fichero de configuracion del classpath"); //$NON-NLS-1$
			}

			config.load(is);
			is.close();
		}
		catch(final NullPointerException e){
			LOGGER.error("No se ha encontrado el fichero de configuracion: ", e); //$NON-NLS-1$
			if (is != null) {
				try { is.close(); } catch (final Exception ex) { /* No hacemos nada */ }
			}
			throw new ClientConfigFilesNotFoundException("No se ha encontrado el fichero de propiedades " + PROPERTY_FILE, PROPERTY_FILE, e); //$NON-NLS-1$
		}
		catch (final Exception e) {
			LOGGER.error("No se pudo cargar el fichero de configuracion {}", PROPERTY_FILE, e); //$NON-NLS-1$
			if (is != null) {
				try { is.close(); } catch (final Exception ex) { /* No hacemos nada */ }
			}
			throw new ClientConfigFilesNotFoundException("No se pudo cargar el fichero de configuracion " + PROPERTY_FILE, PROPERTY_FILE, e); //$NON-NLS-1$
		}
		finally {
			if (is != null) {
				try { is.close(); } catch (final Exception ex) { /* No hacemos nada */ }
			}
		}
		return config;
	}
}
