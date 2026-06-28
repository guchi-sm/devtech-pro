/**
 * BasePaymentProvider
 * All payment providers must extend this class.
 * This enforces a consistent interface across providers.
 */
class BasePaymentProvider {
  constructor(config) {
    this.config = config
  }

  /**
   * Initiate a payment
   * @param {Object} payload - { amount, phone, resourceId, resourceTitle, customerName, customerEmail }
   * @returns {Promise<{ success, checkoutRequestId, externalReference, message }>}
   */
  async initiatePayment(payload) {
    throw new Error(`${this.constructor.name} must implement initiatePayment()`)
  }

  /**
   * Handle webhook/callback from provider
   * @param {Object} body - raw callback body
   * @returns {Promise<{ success, status, externalReference, receiptNo }>}
   */
  async handleCallback(body) {
    throw new Error(`${this.constructor.name} must implement handleCallback()`)
  }

  /**
   * Query payment status from provider
   * @param {string} reference - checkoutRequestId or externalReference
   * @returns {Promise<{ success, status, receiptNo }>}
   */
  async queryStatus(reference) {
    throw new Error(`${this.constructor.name} must implement queryStatus()`)
  }
}

module.exports = BasePaymentProvider
