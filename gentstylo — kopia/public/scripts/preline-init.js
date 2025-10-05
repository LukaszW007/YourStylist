if (typeof window !== "undefined") {
	window.addEventListener("load", () => {
		try {
			// @ts-ignore
			if (window.HSStaticMethods && window.HSStaticMethods.autoInit) {
				// @ts-ignore
				window.HSStaticMethods.autoInit();
			}
		} catch (e) {
			// no-op
		}
	});
}
