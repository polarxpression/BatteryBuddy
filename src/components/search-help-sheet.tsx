
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function SearchHelpSheet({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Search Syntax Guide</SheetTitle>
          <SheetDescription>
            Master the search bar with these powerful syntax options.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Basic Search</h3>
            <p>Just type what you&apos;re looking for. The search will look for matches in the brand, model, type, barcode, and location fields.</p>
            <p className="mt-2"><strong>Example:</strong> <code>panasonic</code></p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Boolean Operators</h3>
            <p>Combine terms with <code>AND</code>, <code>OR</code>, and group with parentheses <code>()</code>. <code>AND</code> is used by default if no operator is present.</p>
            <table className="w-full mt-2 border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Syntax</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>term1 term2</code></td>
                  <td className="border border-gray-300 px-4 py-2">Find batteries that match both terms (implicit AND).</td>
                  <td className="border border-gray-300 px-4 py-2"><code>panasonic eneloop</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>term1 AND term2</code></td>
                  <td className="border border-gray-300 px-4 py-2">Same as above.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>panasonic AND eneloop</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>term1 OR term2</code></td>
                  <td className="border border-gray-300 px-4 py-2">Find batteries that match either term.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>rechargeable OR li-ion</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>(term1 OR term2) AND term3</code></td>
                  <td className="border border-gray-300 px-4 py-2">Group conditions for complex queries.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>(eneloop OR duracell) AND AA</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Advanced Search</h3>
            <table className="w-full mt-2 border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Syntax</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>&quot;exact phrase&quot;</code></td>
                  <td className="border border-gray-300 px-4 py-2">Search for an exact phrase.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>&quot;eneloop pro&quot;</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>-term</code></td>
                  <td className="border border-gray-300 px-4 py-2">Exclude batteries that match the term.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>-disposable</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>~term</code></td>
                  <td className="border border-gray-300 px-4 py-2">Fuzzy search for terms that are similar (up to 2 characters difference).</td>
                  <td className="border border-gray-300 px-4 py-2"><code>~battey</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>field:value</code></td>
                  <td className="border border-gray-300 px-4 py-2">Search within a specific field.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>brand:panasonic</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>field&gt;value</code></td>
                  <td className="border border-gray-300 px-4 py-2">Numeric comparison (also works with <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code>).</td>
                  <td className="border border-gray-300 px-4 py-2"><code>voltage&gt;3.5</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>field:value*</code></td>
                  <td className="border border-gray-300 px-4 py-2">Wildcard search.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>model:en*</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>created_at:YYYY-MM-DD..YYYY-MM-DD</code></td>
                  <td className="border border-gray-300 px-4 py-2">Search for a date range.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>created_at:2023-01-01..2023-06-30</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>fav:me</code></td>
                  <td className="border border-gray-300 px-4 py-2">Show only favorite batteries.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>fav:me</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Sorting and Randomization</h3>
            <table className="w-full mt-2 border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Syntax</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>order:field</code></td>
                  <td className="border border-gray-300 px-4 py-2">Sort results by a field (ascending by default).</td>
                  <td className="border border-gray-300 px-4 py-2"><code>order:voltage</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>order:field desc</code></td>
                  <td className="border border-gray-300 px-4 py-2">Sort results by a field in descending order.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>order:quantity desc</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>?random</code></td>
                  <td className="border border-gray-300 px-4 py-2">Get a random set of results.</td>
                  <td className="border border-gray-300 px-4 py-2"><code>?random</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Available Fields</h3>
            <p>You can use the following fields for field-specific searches:</p>
            <ul className="list-disc list-inside mt-2">
              <li><code>brand</code></li>
              <li><code>model</code></li>
              <li><code>type</code></li>
              <li><code>voltage</code> (numeric)</li>
              <li><code>capacity</code> (numeric)</li>
              <li><code>quantity</code> (numeric)</li>
              <li><code>chemistry</code></li>
              <li><code>barcode</code></li>
              <li><code>location</code></li>
              <li><code>created_at</code> (date)</li>
              <li><code>updated_at</code> (date)</li>
              <li><code>lastUsed</code> (date)</li>
              <li><code>fav</code> (boolean, use <code>fav:me</code>)</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
