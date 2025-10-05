if (typeof window !== "undefined") {
	window.addEventListener("load", () => {
		try {
			// @ts-expect-error -- Preline exposes HSStaticMethods globally
			if (window.HSStaticMethods && window.HSStaticMethods.autoInit) {
				// @ts-expect-error -- Preline exposes HSStaticMethods globally
				window.HSStaticMethods.autoInit();
			}
		} catch {
			// no-op
		}
	});
}
