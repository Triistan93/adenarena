/**
 * EventBus — Sistema pub/sub simples para comunicação desacoplada entre módulos.
 * Uso: EventBus.on('levelUp', cb)  /  EventBus.emit('levelUp', data)  /  EventBus.off('levelUp', cb)
 */
const EventBus = (() => {
  const _handlers = {};

  return {
    /** Inscreve um handler para um evento. Retorna função de cancelamento. */
    on(event, handler) {
      if (!_handlers[event]) _handlers[event] = [];
      _handlers[event].push(handler);
      return () => this.off(event, handler);
    },

    /** Cancela inscrição de um handler específico. */
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

    /** Remove todos os handlers de um evento específico. */
    clear(event) {
      delete _handlers[event];
    }
  };
})();

export default EventBus;
