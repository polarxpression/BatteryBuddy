
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";

export function SearchHelpSheet({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('search:title')}</SheetTitle>
          <SheetDescription>
            {t('search:description')}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">{t('search:basic_search')}</h3>
            <p>{t('search:basic_search_desc')}</p>
            <p className="mt-2"><strong>{t('search:example')}</strong> <code>panasonic</code></p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">{t('search:boolean_operators')}</h3>
            <p>{t('search:boolean_operators_desc')}</p>
            <table className="w-full mt-2 border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:syntax')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:desc')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:example')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>term1 term2</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:find_both_terms')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>panasonic eneloop</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>term1 AND term2</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:same_as_above')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>panasonic AND eneloop</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>term1 OR term2</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:find_either_term')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>rechargeable OR li-ion</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>term1 ~ term2</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:find_either_term_tilde')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>rechargeable ~ li-ion</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>(term1 OR term2) AND term3</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:group_conditions')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>(eneloop ~ duracell) AND AA</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">{t('search:advanced_search')}</h3>
            <table className="w-full mt-2 border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:syntax')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:desc')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:example')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>&quot;exact phrase&quot;</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:exact_phrase')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>&quot;eneloop pro&quot;</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>-term</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:exclude_term')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>-disposable</code></td>
                </tr>
                
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>field:value</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:specific_field')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>brand:panasonic</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>field&gt;value</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:numeric_comparison')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>voltage&gt;3.5</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>field:value*</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:wildcard_search')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>model:en*</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>created_at:YYYY-MM-DD..YYYY-MM-DD</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:date_range')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>created_at:2023-01-01..2023-06-30</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>fav:me</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:show_favorites')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>fav:me</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">{t('search:sorting_randomization')}</h3>
            <table className="w-full mt-2 border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:syntax')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:desc')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('search:example')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>order:field</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:sort_asc')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>order:voltage</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>order:field desc</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:sort_desc')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>order:quantity desc</code></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>?random</code></td>
                  <td className="border border-gray-300 px-4 py-2">{t('search:random_results')}</td>
                  <td className="border border-gray-300 px-4 py-2"><code>?random</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">{t('search:available_fields')}</h3>
            <p>{t('search:available_fields_desc')}</p>
            <ul className="list-disc list-inside mt-2">
              <li><code>brand</code></li>
              <li><code>model</code></li>
              <li><code>type</code></li>
              <li><code>voltage</code> (numeric)</li>
              <li><code>capacity</code> (numeric)</li>
              <li><code>quantity</code> (numeric)</li>
              <li><code>packSize</code> (numeric)</li>
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
