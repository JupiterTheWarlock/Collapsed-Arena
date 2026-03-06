// Mock WebGL context for Three.js testing in jsdom
export function mockWebGLContext() {
  const canvas = document.createElement('canvas');

  // Mock WebGL context
  const mockContext = {
    canvas,
    drawingBufferWidth: 800,
    drawingBufferHeight: 600,
    getContextAttributes: () => ({}),
    isContextLost: () => false,
    supports: () => true,

    // Mock WebGL methods (no-op)
    activeTexture: () => {},
    attachShader: () => {},
    bindAttribLocation: () => {},
    bindBuffer: () => {},
    bindTexture: () => {},
    blendFunc: () => {},
    bufferData: () => {},
    clear: () => {},
    clearColor: () => {},
    clearDepth: () => {},
    enable: () => {},
    disable: () => {},
    drawElements: () => {},
    enableVertexAttribArray: () => {},
    getParameter: () => null,
    getUniformLocation: () => ({}),
    linkProgram: () => {},
    shaderSource: () => {},
    useProgram: () => {},
    vertexAttribPointer: () => {},
    viewport: () => {},

    // Add more mock methods as needed
    createBuffer: () => ({}),
    createProgram: () => ({}),
    createShader: () => ({}),
    createTexture: () => ({}),
    deleteBuffer: () => {},
    deleteProgram: () => {},
    deleteShader: () => {},
    deleteTexture: () => {},

    // WebGL2 methods
    getExtension: () => null,
  };

  // Mock getContext to return our mock context
  const originalGetContext = canvas.getContext;
  canvas.getContext = ((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return mockContext as any;
    }
    return originalGetContext.call(canvas, contextType);
  }) as any;

  return canvas;
}

// Setup global canvas mock
export function setupCanvasMock() {
  let canvas = document.createElement('canvas');

  // Override document.createElement to mock canvas elements
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = ((tagName: string) => {
    if (tagName === 'canvas') {
      canvas = mockWebGLContext();
      return canvas;
    }
    return originalCreateElement(tagName);
  }) as any;
}
