/**
 * UI Store Test Suite
 * Tests for UI state management (sidebar, modals, etc.)
 */

import { describe, it, expect } from 'vitest';

// ══════════════════════════════════════════════════════════════════════════════
// UI Store Mock Implementation
// ══════════════════════════════════════════════════════════════════════════════

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: unknown;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: ModalState;
  isLoading: boolean;
  loadingMessage: string | null;
  breadcrumbs: string[];
}

const createUIStore = () => {
  let state: UIState = {
    sidebarOpen: true,
    sidebarCollapsed: false,
    activeModal: { isOpen: false, type: null, data: null },
    isLoading: false,
    loadingMessage: null,
    breadcrumbs: [],
  };

  return {
    getState: () => state,

    toggleSidebar: () => {
      state = { ...state, sidebarOpen: !state.sidebarOpen };
    },

    openSidebar: () => {
      state = { ...state, sidebarOpen: true };
    },

    closeSidebar: () => {
      state = { ...state, sidebarOpen: false };
    },

    collapseSidebar: () => {
      state = { ...state, sidebarCollapsed: true };
    },

    expandSidebar: () => {
      state = { ...state, sidebarCollapsed: false };
    },

    toggleSidebarCollapse: () => {
      state = { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    },

    openModal: (type: string, data?: unknown) => {
      state = { ...state, activeModal: { isOpen: true, type, data } };
    },

    closeModal: () => {
      state = { ...state, activeModal: { isOpen: false, type: null, data: null } };
    },

    setLoading: (loading: boolean, message?: string) => {
      state = { ...state, isLoading: loading, loadingMessage: message ?? null };
    },

    setBreadcrumbs: (breadcrumbs: string[]) => {
      state = { ...state, breadcrumbs };
    },

    reset: () => {
      state = {
        sidebarOpen: true,
        sidebarCollapsed: false,
        activeModal: { isOpen: false, type: null, data: null },
        isLoading: false,
        loadingMessage: null,
        breadcrumbs: [],
      };
    },
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('UI Store', () => {
  describe('initialization', () => {
    it('should have sidebar open by default', () => {
      const store = createUIStore();
      expect(store.getState().sidebarOpen).toBe(true);
    });

    it('should have sidebar not collapsed by default', () => {
      const store = createUIStore();
      expect(store.getState().sidebarCollapsed).toBe(false);
    });

    it('should have no active modal by default', () => {
      const store = createUIStore();
      expect(store.getState().activeModal.isOpen).toBe(false);
    });

    it('should not be loading by default', () => {
      const store = createUIStore();
      expect(store.getState().isLoading).toBe(false);
    });

    it('should have empty breadcrumbs by default', () => {
      const store = createUIStore();
      expect(store.getState().breadcrumbs).toHaveLength(0);
    });
  });

  describe('sidebar operations', () => {
    it('should toggle sidebar', () => {
      const store = createUIStore();

      store.toggleSidebar();
      expect(store.getState().sidebarOpen).toBe(false);

      store.toggleSidebar();
      expect(store.getState().sidebarOpen).toBe(true);
    });

    it('should open sidebar', () => {
      const store = createUIStore();
      store.closeSidebar();

      store.openSidebar();

      expect(store.getState().sidebarOpen).toBe(true);
    });

    it('should close sidebar', () => {
      const store = createUIStore();

      store.closeSidebar();

      expect(store.getState().sidebarOpen).toBe(false);
    });

    it('should collapse sidebar', () => {
      const store = createUIStore();

      store.collapseSidebar();

      expect(store.getState().sidebarCollapsed).toBe(true);
    });

    it('should expand sidebar', () => {
      const store = createUIStore();
      store.collapseSidebar();

      store.expandSidebar();

      expect(store.getState().sidebarCollapsed).toBe(false);
    });

    it('should toggle sidebar collapse', () => {
      const store = createUIStore();

      store.toggleSidebarCollapse();
      expect(store.getState().sidebarCollapsed).toBe(true);

      store.toggleSidebarCollapse();
      expect(store.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('modal operations', () => {
    it('should open modal with type', () => {
      const store = createUIStore();

      store.openModal('confirm-delete');

      const modal = store.getState().activeModal;
      expect(modal.isOpen).toBe(true);
      expect(modal.type).toBe('confirm-delete');
    });

    it('should open modal with data', () => {
      const store = createUIStore();
      const data = { id: 'promo-001', name: 'Test Promotion' };

      store.openModal('edit-promotion', data);

      const modal = store.getState().activeModal;
      expect(modal.data).toEqual(data);
    });

    it('should close modal', () => {
      const store = createUIStore();
      store.openModal('test-modal', { test: true });

      store.closeModal();

      const modal = store.getState().activeModal;
      expect(modal.isOpen).toBe(false);
      expect(modal.type).toBeNull();
      expect(modal.data).toBeNull();
    });

    it('should replace modal when opening new one', () => {
      const store = createUIStore();
      store.openModal('first-modal', { first: true });

      store.openModal('second-modal', { second: true });

      const modal = store.getState().activeModal;
      expect(modal.type).toBe('second-modal');
      expect(modal.data).toEqual({ second: true });
    });
  });

  describe('loading state', () => {
    it('should set loading state', () => {
      const store = createUIStore();

      store.setLoading(true);

      expect(store.getState().isLoading).toBe(true);
    });

    it('should set loading with message', () => {
      const store = createUIStore();

      store.setLoading(true, 'Saving changes...');

      expect(store.getState().isLoading).toBe(true);
      expect(store.getState().loadingMessage).toBe('Saving changes...');
    });

    it('should clear loading state', () => {
      const store = createUIStore();
      store.setLoading(true, 'Loading...');

      store.setLoading(false);

      expect(store.getState().isLoading).toBe(false);
      expect(store.getState().loadingMessage).toBeNull();
    });
  });

  describe('breadcrumbs', () => {
    it('should set breadcrumbs', () => {
      const store = createUIStore();

      store.setBreadcrumbs(['Home', 'Promotions', 'Detail']);

      expect(store.getState().breadcrumbs).toEqual(['Home', 'Promotions', 'Detail']);
    });

    it('should replace breadcrumbs', () => {
      const store = createUIStore();
      store.setBreadcrumbs(['Home', 'Promotions']);

      store.setBreadcrumbs(['Home', 'Claims']);

      expect(store.getState().breadcrumbs).toEqual(['Home', 'Claims']);
    });

    it('should clear breadcrumbs', () => {
      const store = createUIStore();
      store.setBreadcrumbs(['Home', 'Promotions']);

      store.setBreadcrumbs([]);

      expect(store.getState().breadcrumbs).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      const store = createUIStore();

      // Modify all state
      store.closeSidebar();
      store.collapseSidebar();
      store.openModal('test', { data: true });
      store.setLoading(true, 'Loading');
      store.setBreadcrumbs(['Home', 'Test']);

      // Reset
      store.reset();

      const state = store.getState();
      expect(state.sidebarOpen).toBe(true);
      expect(state.sidebarCollapsed).toBe(false);
      expect(state.activeModal.isOpen).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.breadcrumbs).toHaveLength(0);
    });
  });
});
