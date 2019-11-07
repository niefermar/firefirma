package es.gob.fire.upgrade;

import java.util.Date;

/**
 * Resultado de una operaci&oacute;n de actualizaci&oacute;n. Compuesto por la firma resultante y
 * el identificador del formato longevo al que se ha actualizado.
 */
public class UpgradeResult {

	private final byte[] result;

	private final String format;

	private final GracePeriodInfo gracePeriodInfo;

	private final State state;

	/**
	 * Construye el resultado de la actualizaci&oacute;n en donde se proporciona
	 * la firma obtenida.
	 * @param result Firma resultante.
	 * @param format Identificador del formato longevo.
	 */
	public UpgradeResult(final byte[] result, final String format) {
		this.result = result;
		this.format = format;
		this.gracePeriodInfo = null;
		this.state = State.COMPLETE;
	}

	/**
	 * Construye el resultado de la actualizaci&oacute;n, en donde se indica que
	 * debe esperarse un periodo de gracia para obtener la firma.
	 * @param responseId Identificador de operaci&oacute;n para obtener la respuesta.
	 * @param resolutionDate Fecha hasta la que se debe esperar.
	 */
	public UpgradeResult(final String responseId, final Date resolutionDate) {
		this.result = null;
		this.format = null;
		this.gracePeriodInfo = new GracePeriodInfo(responseId, resolutionDate);
		this.state = State.PENDING;
	}

	/**
	 * Recupera la firma resultante de la actualizaci&oacute;n.
	 * @return Firma electr&oacute;nica.
	 */
	public byte[] getResult() {
		return this.result;
	}

	/**
	 * Recupera el identificador del formato al que se ha actualizado
	 * la firma.
	 * @return Idenficador del formato longevo.
	 */
	public String getFormat() {
		return this.format;
	}

	/**
	 * Recupera la informaci&oacute;n sobre el periodo de gracia que se debe conceder antes de
	 * poder recuperar el resultado de la firma.
	 * @return Informaci&oacute;n del periodo de gracia o {@code null} si no lo hay.
	 */
	public GracePeriodInfo getGracePeriodInfo() {
		return this.gracePeriodInfo;
	}

	/**
	 * Recupera el estado de la actualizaci&oacute;n de firma, que puede haber terminado (se
	 * proporciona la firma en la respuesta) o estar pendiente (se debe esperar un periodo de
	 * gracia).
	 * @return Estado del proceso de actualizaci&oacute;n.
	 */
	public State getState() {
		return this.state;
	}

	/**
	 * Estado del proceso de actualizaci&oacute;n.
	 */
	public static enum State {
		PENDING,
		COMPLETE
	}
}
