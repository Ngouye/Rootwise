package sn.cryptoplatform.media.internal;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Stockage en mémoire pour les tests ({@code app.storage.type=memory}). */
@Component
@ConditionalOnProperty(name = "app.storage.type", havingValue = "memory")
class InMemoryObjectStorage implements ObjectStorage {

	private final Map<String, byte[]> objects = new ConcurrentHashMap<>();

	@Override
	public void put(String key, String contentType, long size, InputStream content) throws IOException {
		objects.put(key, content.readNBytes((int) size));
	}

	@Override
	public InputStream read(String key, long start, long end) throws IOException {
		byte[] data = objects.get(key);
		if (data == null) {
			throw new IOException("Objet introuvable : " + key);
		}
		return new ByteArrayInputStream(Arrays.copyOfRange(data, (int) start, (int) Math.min(end + 1, data.length)));
	}

	@Override
	public void delete(String key) {
		objects.remove(key);
	}
}
