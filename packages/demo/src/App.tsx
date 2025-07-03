import { renderPdf } from '@pandapage/pandapage';

const App = () => {
  const result = renderPdf('dummy.pdf');
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">PandaPage Demo</h1>
        <p className="text-gray-600 mb-4">This is a demo of the PandaPage library.</p>
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Result from renderPdf():</p>
          <p className="text-lg font-mono text-gray-800">{result}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
