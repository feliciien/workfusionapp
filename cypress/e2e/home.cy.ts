describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page', () => {
    cy.get('h1').should('exist');
  });

  it('should have working navigation', () => {
    cy.get('nav').should('exist');
    cy.get('nav a').should('have.length.at.least', 1);
  });

  it('should be responsive', () => {
    // Test mobile view
    cy.viewport('iphone-x');
    cy.get('nav').should('exist');
    
    // Test tablet view
    cy.viewport('ipad-2');
    cy.get('nav').should('exist');
    
    // Test desktop view
    cy.viewport(1280, 720);
    cy.get('nav').should('exist');
  });
});
