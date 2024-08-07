describe('Router Link', () => {
  beforeEach(() => {
    cy.visit('/lazy/router-link?ionic:_testing=true');
  });

  describe('router-link params and fragments', () => {
    const queryParam = 'A&=#Y';
    const fragment = 'myDiv1';
    const id = 'MyPageID==';

    it('should go to a page with properly encoded values', () => {
      cy.get('#queryParamsFragment').click();

      const expectedPath = `${encodeURIComponent(id)}`;
      const expectedSearch = `?token=${encodeURIComponent(queryParam)}`;
      const expectedHash = `#${encodeURIComponent(fragment)}`;

      cy.location().should((location) => {
        expect(location.pathname).to.contain(expectedPath);
        expect(location.search).to.eq(expectedSearch);
        expect(location.hash).to.eq(expectedHash);
      });
    });

    it('should return to a page with preserved query param and fragment', () => {
      cy.get('#queryParamsFragment').click();
      cy.get('#goToPage3').click();

      cy.location().should((location) => {
        expect(location.pathname).to.contain('router-link-page3');
      });

      cy.get('#goBackFromPage3').click();

      const expectedPath = `${encodeURIComponent(id)}`;
      const expectedSearch = `?token=${encodeURIComponent(queryParam)}`;
      const expectedHash = `#${encodeURIComponent(fragment)}`;

      cy.location().should((location) => {
        expect(location.pathname).to.contain(expectedPath);
        expect(location.search).to.eq(expectedSearch);
        expect(location.hash).to.eq(expectedHash);
      });
    });

    it('should preserve query param and fragment with defaultHref string', () => {
      cy.visit('/lazy/router-link-page3?ionic:_testing=true');

      cy.get('#goBackFromPage3').click();

      const expectedSearch = '?token=ABC';
      const expectedHash = '#fragment';

      cy.location().should((location) => {
        expect(location.search).to.eq(expectedSearch);
        expect(location.hash).to.eq(expectedHash);
      });
    });
  });

  describe('router-link', () => {
    it('should have correct lifecycle counts', () => {
      cy.testLifeCycle('app-router-link', {
        ionViewWillEnter: 1,
        ionViewDidEnter: 1,
        ionViewWillLeave: 0,
        ionViewDidLeave: 0,
      });
    });
  });

  describe('forward', () => {
    it('should go forward with ion-button[routerLink]', () => {
      cy.get('#routerLink').click();
      testForward();
    });

    it('should go forward with a[routerLink]', () => {
      cy.get('#a').click();
      testForward();
    });

    it('should go forward with button + navigateByUrl()', () => {
      cy.get('#button').click();
      testForward();
    });

    it('should go forward with button + navigateForward()', () => {
      cy.get('#button-forward').click();
      testForward();
    });
  });

  describe('root', () => {
    it('should go root with ion-button[routerLink][routerDirection=root]', () => {
      cy.get('#routerLink-root').click();
      testRoot();
    });

    it('should go root with a[routerLink][routerDirection=root]', () => {
      cy.get('#a-root').click();
      testRoot();
    });

    it('should go root with button + navigateRoot', () => {
      cy.get('#button-root').click();
      testRoot();
    });
  });

  describe('back', () => {
    it('should go back with ion-button[routerLink][routerDirection=back]', () => {
      cy.get('#routerLink-back').click();
    });

    it('should go back with a[routerLink][routerDirection=back]', () => {
      cy.get('#a-back').click();
      testBack();
    });

    it('should go back with button + navigateBack', () => {
      cy.get('#button-back').click();
      testBack();
    });
  });

  // Angular sets the `tabindex` to `"0"` on any element that uses
  // the `routerLink` directive. Ionic removes the `tabindex` from
  // components that wrap an `a` or `button` element, so we are
  // checking here that it is only removed from Ionic components.
  // https://github.com/ionic-team/ionic-framework/issues/20632
  describe('tabindex', () => {
    it('should have tabindex="0" with a native span', () => {
      cy.get('#span').should('have.attr', 'tabindex', '0');
    });

    it('should not have tabindex set with an ionic button', () => {
      cy.get('#routerLink').should('not.have.attr', 'tabindex');
    });
  });
});

function testForward() {
  cy.testStack('ion-router-outlet', ['app-router-link', 'app-router-link-page']);
  cy.testLifeCycle('app-router-link-page', {
    ionViewWillEnter: 1,
    ionViewDidEnter: 1,
    ionViewWillLeave: 0,
    ionViewDidLeave: 0,
  });
  cy.get('app-router-link-page #canGoBack').should('have.text', 'true');

  cy.go('back');
  cy.testStack('ion-router-outlet', ['app-router-link']);
  cy.testLifeCycle('app-router-link', {
    ionViewWillEnter: 2,
    ionViewDidEnter: 2,
    ionViewWillLeave: 1,
    ionViewDidLeave: 1,
  });
}

function testRoot() {
  cy.testStack('ion-router-outlet', ['app-router-link-page']);
  cy.testLifeCycle('app-router-link-page', {
    ionViewWillEnter: 1,
    ionViewDidEnter: 1,
    ionViewWillLeave: 0,
    ionViewDidLeave: 0,
  });
  cy.get('app-router-link-page #canGoBack').should('have.text', 'false');

  cy.go('back');
  cy.testStack('ion-router-outlet', ['app-router-link']);
  cy.testLifeCycle('app-router-link', {
    ionViewWillEnter: 1,
    ionViewDidEnter: 1,
    ionViewWillLeave: 0,
    ionViewDidLeave: 0,
  });
}

function testBack() {
  cy.testStack('ion-router-outlet', ['app-router-link-page']);
  cy.testLifeCycle('app-router-link-page', {
    ionViewWillEnter: 1,
    ionViewDidEnter: 1,
    ionViewWillLeave: 0,
    ionViewDidLeave: 0,
  });
  cy.get('app-router-link-page #canGoBack').should('have.text', 'false');

  cy.go('back');
  cy.testStack('ion-router-outlet', ['app-router-link']);
  cy.testLifeCycle('app-router-link', {
    ionViewWillEnter: 1,
    ionViewDidEnter: 1,
    ionViewWillLeave: 0,
    ionViewDidLeave: 0,
  });
}
