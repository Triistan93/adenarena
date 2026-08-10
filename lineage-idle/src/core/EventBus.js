/**
 * EventBus ÔÇö Sistema pub/sub simples para comunica├º├úo desacoplada entre m├│dulos.
 * Uso: EventBus.on('levelUp', cb)  /  EventBus.emit('levelUp', data)  /  EventBus.off('levelUp', cb)
 */
const EventBus = (() => {
  const _handlers = {};

  return {
    /** Inscreve um handler para um evento. Retorna fun├º├úo de cancelamento. */
    on(event, handler) {
      if (!_handlers[event]) _handlers[event] = [];
      _handlers[event].push(handler);
      return () => this.off(event, handler);
    },

    /** Cancela inscri├º├úo de um handler espec├¡fico. */
    off(event, handler) {
      if (!_handlers[event]) return;
      _handlers[event] = _handlers[event].filter(h => h !== handler);
    },

    /** Dispara um evento com dados opcionais para todos os handlers inscritos. */
    emit(event, data) {
      (_handlers[event] || []).forEach(h => {
        try { h(data); } catch (e) { console.error(`[EventBus] Error in handler for "${event}":`, e); }
      });
    },

    /** Remove todos os handlers de um evento espec├¡fico. */
    clear(event) {
      delete _handlers[event];
    }
  };
})();

export default EventBus;