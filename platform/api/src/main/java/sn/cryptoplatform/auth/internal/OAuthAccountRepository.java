package sn.cryptoplatform.auth.internal;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface OAuthAccountRepository extends JpaRepository<OAuthAccount, Long> {

	Optional<OAuthAccount> findByProviderAndProviderUserId(OAuthAccount.Provider provider, String providerUserId);
}
