package sn.cryptoplatform.media.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.util.unit.DataSize;

import sn.cryptoplatform.media.MediaKind;

class DefaultMediaServiceTests {

	private static final byte[] PNG = { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 'I', 'H', 'D', 'R', 1, 2, 3 };

	@Test
	void aFileIsRemovedFromStorageWhenItsRecordCannotBeSaved() {
		MediaAssetRepository assets = mock(MediaAssetRepository.class);
		when(assets.save(any(MediaAsset.class))).thenThrow(new DataAccessResourceFailureException("connexion coupée"));
		RecordingStorage storage = new RecordingStorage();
		DefaultMediaService media = new DefaultMediaService(assets, storage, properties());

		assertThatThrownBy(() -> media.store(1L, MediaKind.IMAGE, "photo.png", PNG.length, new ByteArrayInputStream(PNG)))
				.isInstanceOf(DataAccessResourceFailureException.class);

		assertThat(storage.written).hasSize(1);
		assertThat(storage.objects).as("aucun fichier orphelin").isEmpty();
	}

	private static StorageProperties properties() {
		return new StorageProperties("memory", null, "us-east-1", null, null, "test", true,
				new StorageProperties.Limits(DataSize.ofMegabytes(50), DataSize.ofMegabytes(50), DataSize.ofMegabytes(5)));
	}

	/** Stockage qui garde la trace des écritures et des suppressions. */
	private static final class RecordingStorage implements ObjectStorage {

		final List<String> written = new ArrayList<>();
		final Set<String> objects = ConcurrentHashMap.newKeySet();

		@Override
		public void put(String key, String contentType, long size, InputStream content) throws IOException {
			content.readNBytes((int) size);
			written.add(key);
			objects.add(key);
		}

		@Override
		public InputStream read(String key, long start, long end) {
			throw new UnsupportedOperationException();
		}

		@Override
		public void delete(String key) {
			objects.remove(key);
		}
	}
}
