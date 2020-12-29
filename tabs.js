/**
 * Vanilla JS tabs
 * ===============
 * 
 * Naming conventions
 * ------------------
 * 
 * A tab has two parts: A tab control (button) and a tab panel (element that holds content)
 * 
 * 
 * Overview
 * --------
 * 
 * All content is displayed by default.
 * When a tab is activated,
 *  - the panel gets the class: .active-tab-panel
 *  - the control gets the class: .active-tab-control
 * Panels without the above class are hidden by CSS.
 * The first tab is active by default, but this can be overridden by including these classes in the HTML.
 */

function loadTabs() {
  'use strict';
  
  // Function definitions
  
  function init() {
    // Check for multiple containers with tabs
    const containers = [...document.querySelectorAll('.tab-container')];

    // If there are tab containers, set up their tabs
    containers.length > 0 && containers.forEach(container => new TabContainer(container));
  }

  function initTabs(tabContainer) {
    // Create Tab instances from controls found in this parent panel
    const tabCtrls = [...tabContainer.node.querySelectorAll('.tab-controls [role=tab]')];
    const tabs = tabCtrls.map(tabCtrl => new Tab(tabCtrl, tabContainer));
    
    // Check if any of the controls have already been marked as active
    // (this allows the initial active tab to optionally be set in the HTML)
    const activeCtrls = tabCtrls.filter(ctrl => ctrl.classList.contains('active-tab-control'));

    let initialActiveTab; // will contain an instance of Tab

    if (activeCtrls.length) {
      // Set the active tab to the first marked as active in the DOM
      initialActiveTab = tabs.filter(tab => tab.ctrl === activeCtrls[0])[0];

      // Warn the user if more than one tab control is marked as active
      if (activeCtrls.length > 1) {
        throw new Error("Multiple tab controls were found with the class 'active-tab-control'. Only one was expected, so the first has been marked active by default.");
      }
    } else if (tabCtrls.length) {
      // If tabs are present but none are marked as active, set the first one to active by default
      initialActiveTab = tabs.filter(tab => tab.ctrl === tabCtrls[0])[0];
    } else {
      // no tabs are present
      return [];
    }

    // Now that we know which one should be active, activate it
    initialActiveTab.activate();
    
    // Make the others clickable
    tabs.filter(tab => tab !== initialActiveTab).forEach(tab => {
      tab.deactivate();
    });

    // Keep track of which tab to deactivate if/when another becomes active
    tabContainer.activeTab = initialActiveTab;

    return tabs;
  }

  // Prototype definitions
  function TabContainer(container) {
    // Declare members
    this.node = container;
    this.tabs = initTabs(this);
    this.activeTab; // will contain an instance of Tab
    this.prevActiveTab; // will contain an instance of Tab
  }

  function Tab(tabCtrl, tabContainer) {
    this.ctrl = tabCtrl;
    this.panel = document.querySelector(`#${tabCtrl.getAttribute('aria-controls')}`);

    // Create a named reference to the handler so it can be removed as needed
    this.activate = (function() {
      // If there's already an active tab (i.e. this is not the first load),
      // Mark it as 'previous' so it can be deactivated
      if (tabContainer.activeTab) {
        tabContainer.prevActiveTab = tabContainer.activeTab;
      }

      // Display tab content
      this.panel.classList.add('active-tab-panel');

      // Update tab navigation
      this.ctrl.classList.add('active-tab-control');
      this.ctrl.removeEventListener('click', this.activate); // if not present, this does nothing

      // If there was a previously active tab, deactivate it
      tabContainer.prevActiveTab && tabContainer.prevActiveTab.deactivate();

      // Keep track of which tab to deactivate if/when another becomes active
      tabContainer.activeTab = this;

    // Bind so the func can be used as an EventListener,
    // with 'this' still referring to the Tab instance (not the EventTarget)
    }).bind(this);

    this.deactivate = function() {
      this.ctrl.classList.remove('active-tab-control');
      this.panel.classList.remove('active-tab-panel');
      this.ctrl.addEventListener('click', this.activate);
    };
  }

  // Start running things
  try {
    init();
  } catch (error) {
    console.warn(error);
  }
}

window.addEventListener('load', () => { loadTabs(); });
